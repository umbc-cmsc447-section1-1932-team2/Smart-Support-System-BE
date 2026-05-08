import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { sendResponse } from 'src/utils/responses.dto';
import { PrismaService } from 'prisma/prisma.service';
import { SignupDto, UpdateProfileDto } from './user.dto';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException
} from '@nestjs/common';
import { Role } from '@prisma/client';


@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) { }

  getAllUsers = async () => {
    const data = await this.prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        phone: true,
        role: true,
        verification: true
      },
    });

    return sendResponse('All users fetched successfully', data);
  };


  createUser = async (data: SignupDto) => {
    const { password, ...body } = data;

    // Check email isn't already taken before attempting to create
    const existing = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existing) throw new ConflictException('Email is already in use');

    const hashedPassword = await bcrypt.hash(password, 10);

    const verification = !data.role || data.role === Role.USER ? 'VERIFIED' : 'UNVERIFIED'

    await this.prisma.user.create({
      data: {
        ...body,
        password: hashedPassword,
        verification,
      },
    });

    return sendResponse('User created successfully', {
      ...body,
      verification,
    });
  };

  //checks to see if a users status is verified or not
  verifyUser = async (userId: string) => {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User Not Found');

    if (user.role === Role.USER) {

      throw new BadRequestException('Customers Do Not Require Verification');
    }

    if (user.verification === "VERIFIED") {
      throw new BadRequestException('User Is Already Verified');
    }

    //is username necessary?
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { verification: 'VERIFIED' },
      select: { id: true, email: true, username: true, role: true, verification: true },
    });

    return sendResponse('User Verified Successfully', updated);
  };


  updateProfile = async (userId: string, dto: UpdateProfileDto) => {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User Not Found');

    const updateData: any = {};

    // update email
    if (dto.email) {
      const existing = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });
      if (existing && existing.id !== userId) {
        throw new ConflictException('Email Is Already In Use');
      }
      updateData.email = dto.email;
    }

    // should we handle username or just stick with e-mail?
    // handle username change
    //if (dto.username) {
    //  updateData.username = dto.username;
    //}

    // update phone number
    if (dto.phone) {
      updateData.phone = dto.phone;
    }

    
    // update passowrd
    if (dto.newPassword) {
      if (!dto.currentPassword) {
        throw new BadRequestException(
          'Current Password Is Required To Set A New Password',
        );
      }
      const passwordMatch = await bcrypt.compare(
        dto.currentPassword,
        user.password,
      );
      if (!passwordMatch) {
        throw new BadRequestException('Current Password Is Incorrect');
      }
      updateData.password = await bcrypt.hash(dto.newPassword, 10);
    }

    if (Object.keys(updateData).length === 0) {
      throw new BadRequestException('No Fields Provided To Update');
    }


    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        username: true,
        phone: true,
        role: true,
        verification: true,
      },
    });

    return sendResponse('Profile updated successfully', updated);
  };


  /**
   * Admin deletes a user account.
   */
  deleteUser = async (userId: string, adminId: string) => {
    if (userId === adminId) {
      throw new ForbiddenException('You Cannot Delete Your Own Account');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    await this.prisma.user.delete({ where: { id: userId } });
    return sendResponse('User Deleted Successfully', {});
  };

}
