import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { DATABASE_URL } from '../prisma.config';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    if (!DATABASE_URL) throw Error('Set the DATABASE_URL in .env');
    const adapter = new PrismaPg({
      connectionString: DATABASE_URL,
    });
    super({ adapter });
  }

  onModuleInit = async () =>
    await this.$connect()
      .then(() => console.log('Connected to database'))
      .catch((err) => console.log('Failed to connect to database\n', err));

  onModuleDestroy = async () =>
    await this.$disconnect()
      .then(() => console.log('Database disconnected.'))
      .catch((err) => console.log('Error occured while disconecting:\n', err));
}
