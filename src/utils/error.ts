import { Prisma } from '@prisma/client';
import {
  HttpException,
  ConflictException,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';

export function serverError(error: unknown) {
  // If it's already a NestJS HTTP exception, rethrow it as-is
  if (error instanceof HttpException) {
    throw error;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        throw new ConflictException(error.message);
      case 'P2025':
        throw new NotFoundException(error.message);
      case 'P2003':
        throw new BadRequestException(error.message);
      default:
        throw new InternalServerErrorException(error.message);
    }
  }

  throw new InternalServerErrorException(`Unexpected error occurred ${error}`);
}
