import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { sendResponse } from 'src/utils/responses.dto';
import { PrismaService } from 'prisma/prisma.service';
import { SignupDto } from './user.dto';
import { BadRequestException } from '@nestjs/common';

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
        company: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return sendResponse('All users fetched successfully', data);
  };
  createUser = async (data: SignupDto) => {
    const { password, companyId, ...body } = data;
    if (companyId) {
      const company = await this.prisma.company.findUnique({
        where: { id: companyId },
      });

      if (!company) throw new BadRequestException('Company does not exist');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await this.prisma.user.create({
      data: {
        ...body,
        password: hashedPassword,
        ...(companyId ? { companyId } : {}),
      },
    });
    return sendResponse('User created successfully', body);
  };
}
