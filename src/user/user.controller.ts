import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { SignupDto } from './user.dto';
import { asyncWrapper } from 'src/utils/helper';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @HttpCode(200)
  @Get('/all')
  async getAllUsers() {
    return asyncWrapper(() => this.userService.getAllUsers());
  }

  @Post('/signup')
  @HttpCode(201)
  async createUser(@Body() dto: SignupDto) {
    return asyncWrapper(() => this.userService.createUser(dto));
  }
}
