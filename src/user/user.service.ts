import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { sendResponse } from 'src/utils/responses.dto';
import { PrismaService } from 'prisma/prisma.service';
import { SignupDto } from './user.dto';
import { BadRequestException, ConflictException } from '@nestjs/common';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}
  getAllUsers = async () => {
    const data = await this.prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        phone: true,
        role: true,
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
    await this.prisma.user.create({
      data: {
        ...body,
        password: hashedPassword,
      },
    });
    return sendResponse('User created successfully', body);
  };
}
