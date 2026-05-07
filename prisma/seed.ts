import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';
import 'dotenv/config';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) throw new Error('DATABASE_URL is not set');

const adapter = new PrismaPg({ connectionString: DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const existing = await prisma.user.findUnique({
    where: { email: 'admin@smartsupport.com' },
  });

  if (!existing) {
    await prisma.user.create({
      data: {
        email: 'admin@smartsupport.com',
        password: await bcrypt.hash('admin123', 10),
        role: 'ADMIN',
        username: 'admin',
        verification: 'VERIFIED', //default admin auto-verified
      },
    });
    console.log('Default admin created');
  } else {
    console.log('Admin already exists, skipping seed');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());