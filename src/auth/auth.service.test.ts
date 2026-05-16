import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { PrismaService } from 'prisma/prisma.service';
import { makePrisma, makeJwtService, mockUser } from '../test-utils';


describe('AuthService', () => {
  let service: AuthService;
  let prisma: ReturnType<typeof makePrisma>;

  beforeEach(async () => {
    prisma = makePrisma();
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: makeJwtService() },
      ],
    }).compile();
    service = module.get(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  const doLogin = async () => {
    prisma.user.findUnique.mockResolvedValue(mockUser());
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    const { data } = await service.login({
      email: 'test@email.com',
      password: 'password123',
    });
    return data.refreshToken as string;
  };

  describe('login', () => {
    it('returns tokens and user data with credentials', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser());
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login({
        email: 'test@email.com',
        password: 'password123',
      });

      expect(result.message).toBe('Login successful');
      expect(result.data).toMatchObject({
        id: 'user-1',
        email: 'test@email.com',
        accessToken: 'test.access.token',
        expiresIn: 900,
        tokenType: 'Bearer',
      });
      expect(result.data.refreshToken).toBeDefined();
    });

    it('returns UnauthorizedException when user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(
        service.login({ email: 'usernotexist@x.com', password: 'password123' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('returns UnauthorizedException on wrong password', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser());
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      await expect(
        service.login({ email: 'test@email.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refresh', () => {
    it('issues new access token and rotates refresh token', async () => {
      const refreshToken = await doLogin();
      prisma.user.findUnique.mockResolvedValue(mockUser());

      const result = await service.refresh({ refreshToken });

      expect(result.data.accessToken).toBe('test.access.token');
      expect(result.data.refreshToken).not.toBe(refreshToken);
    });

    it('returns BadRequestException for unknown token', async () => {
      await expect(service.refresh({ refreshToken: 'bogus' })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('returns UnauthorizedException for expired token', async () => {
      const refreshToken = await doLogin();
      jest.useFakeTimers();
      jest.setSystemTime(Date.now() + 8 * 24 * 60 * 60 * 1000);

      await expect(service.refresh({ refreshToken })).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('returns UnauthorizedException when user no longer exists', async () => {
      const refreshToken = await doLogin();
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.refresh({ refreshToken })).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('logout', () => {
    it('invalidates the refresh token and returns success', async () => {
      const refreshToken = await doLogin();
      const result = await service.logout({ refreshToken });
      expect(result.message).toBe('Logged out successfully');
    });

    it('returns UnauthorizedException for unknown token', async () => {
      await expect(service.logout({ refreshToken: 'bogus' })).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('returns UnauthorizedException on double logout', async () => {
      const refreshToken = await doLogin();
      await service.logout({ refreshToken });
      await expect(service.logout({ refreshToken })).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
