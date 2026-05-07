import {
  Body,
  Controller,
  Get,
  Delete,
  Param,
  Patch,
  Post,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { UserService } from './user.service';
import { SignupDto, UpdateProfileDto } from './user.dto';
import { asyncWrapper } from 'src/utils/helper';
import { JwtGuard } from 'src/auth/jwt.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { Protected } from 'src/auth/jwt.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  //@Protected()
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


  /**
   * PATCH /user/profile
   * any logged in user can edit their account details
   */
  @UseGuards(JwtGuard)
  @HttpCode(200)
  @Patch('/profile')
  async updateProfile(
    @CurrentUser() user: { id: string },
    @Body() dto: UpdateProfileDto,
  ) { return asyncWrapper(() => this.userService.updateProfile(user.id, dto)) };


  /**
   * PATCH /user/:id/verify
   * Admin level verification route to verify agents/admins
   */
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(200)
  @Patch('/:id/verify')
  async verifyUser(@Param('id') id: string) {
    return asyncWrapper(() => this.userService.verifyUser(id));
  }

  
  /**
   * DELETE /user/:id
   * delete an account (admin level only!)
   */

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(200)
  @Delete('/:id')
  async deleteUser(
    @Param('id') id: string,
    @CurrentUser() admin: { id: string }
  ) { return asyncWrapper(() => this.userService.deleteUser(id, admin.id)); }
}
