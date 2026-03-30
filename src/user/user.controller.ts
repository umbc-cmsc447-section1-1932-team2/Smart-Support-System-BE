import { Body, Controller, Get, HttpCode, Post, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { SignupDto } from './user.dto';
import { asyncWrapper } from 'src/utils/helper';
import { JwtGuard } from 'src/auth/jwt.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * GET /user/all
   * Protected — requires a valid Bearer token in the Authorization header.
   * Example header: Authorization: Bearer <accessToken>
   */
  @UseGuards(JwtGuard)
  @HttpCode(200)
  @Get('/all')
  async getAllUsers() {
    return asyncWrapper(() => this.userService.getAllUsers());
  }

  /**
   * POST /user/signup
   * Public — no token required.
   */
  @Post('/signup')
  @HttpCode(201)
  async createUser(@Body() dto: SignupDto) {
    return asyncWrapper(() => this.userService.createUser(dto));
  }
}
