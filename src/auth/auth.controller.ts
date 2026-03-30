import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RefreshDto } from './auth.dto';
import { asyncWrapper } from 'src/utils/helper';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /auth/login
   * Body: { email, password }
   * Returns: { accessToken, refreshToken, expiresIn, tokenType }
   */
  @HttpCode(200)
  @Post('/login')
  async login(@Body() dto: LoginDto) {
    return asyncWrapper(() => this.authService.login(dto));
  }

  /**
   * POST /auth/refresh
   * Body: { refreshToken }
   * Returns: new { accessToken, refreshToken }
   */
  @HttpCode(200)
  @Post('/refresh')
  async refresh(@Body() dto: RefreshDto) {
    return asyncWrapper(() => this.authService.refresh(dto));
  }

  /**
   * POST /auth/logout
   * Body: { refreshToken }
   * Invalidates the refresh token server-side.
   */
  @HttpCode(200)
  @Post('/logout')
  async logout(@Body() dto: RefreshDto) {
    return asyncWrapper(() => this.authService.logout(dto));
  }
}
