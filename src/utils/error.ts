import { Prisma } from '@prisma/client';
import {
  ConflictException,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';

export function serverError(error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002': {
        throw new ConflictException(error.message);
      }
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
