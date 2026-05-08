import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'prisma/prisma.service';
import { sendResponse } from 'src/utils/responses.dto';
import { LoginDto, RefreshDto } from './auth.dto';

// In-memory refresh token store.
// For production, move this to a DB table (e.g. RefreshToken model in Prisma).
const refreshTokenStore = new Map<
  string,
  { userId: string; expiresAt: Date }
>();

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  login = async (dto: LoginDto) => {
    const { email, password } = dto;

    // 1. Find user by email
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user)
      throw new UnauthorizedException(
        'The user with this email does not exist',
      );

    // 2. Compare password against stored bcrypt hash
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch)
      throw new UnauthorizedException('Incorrect password was provided.');

    // 3. Block Unverified Agents/Admins
    if (user.role !== 'USER' && user.verification === 'UNVERIFIED') {
      throw new ForbiddenException(
        'Your account is pending admin verification. Please contact an administrator.',
      );
    }

    // 4. Sign a short-lived access token (15 min)
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    // 5. Generate an opaque refresh token valid for 7 days
    const refreshToken = crypto.randomBytes(64).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    refreshTokenStore.set(refreshToken, { userId: user.id, expiresAt });

    return sendResponse('Login successful', {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      accessToken,
      refreshToken,
      expiresIn: 900, // seconds (15 min)
      tokenType: 'Bearer',
    });
  };

  refresh = async (dto: RefreshDto) => {
    const { refreshToken } = dto;

    // 1. Look up the refresh token
    const stored = refreshTokenStore.get(refreshToken);
    if (!stored) throw new BadRequestException('Invalid refresh token');

    // 2. Check it has not expired
    if (stored.expiresAt < new Date()) {
      refreshTokenStore.delete(refreshToken);
      throw new UnauthorizedException(
        'Refresh token expired, please log in again',
      );
    }

    // 3. Load the user
    const user = await this.prisma.user.findUnique({
      where: { id: stored.userId },
    });
    if (!user) throw new UnauthorizedException('User not found');

    // 4. Issue a fresh access token
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    // 5. Rotate the refresh token (invalidate old, issue new)
    refreshTokenStore.delete(refreshToken);
    const newRefreshToken = crypto.randomBytes(64).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    refreshTokenStore.set(newRefreshToken, { userId: user.id, expiresAt });

    return sendResponse('Token refreshed', {
      accessToken,
      refreshToken: newRefreshToken,
      expiresIn: 900,
      tokenType: 'Bearer',
    });
  };

  logout = async (dto: RefreshDto) => {
    if (!refreshTokenStore.has(dto.refreshToken))
      throw new UnauthorizedException('Invalid refresh token');
    refreshTokenStore.delete(dto.refreshToken);
    return sendResponse('Logged out successfully', {});
  };
}
