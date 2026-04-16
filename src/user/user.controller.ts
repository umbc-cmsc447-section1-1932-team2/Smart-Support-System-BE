import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { SignupDto } from './user.dto';
import { asyncWrapper } from 'src/utils/helper';
import { Protected } from 'src/auth/jwt.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Protected()
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
