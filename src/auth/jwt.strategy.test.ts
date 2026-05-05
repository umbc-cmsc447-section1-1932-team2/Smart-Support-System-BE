import { Test } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy } from './jwt.strategy';
import { PrismaService } from 'prisma/prisma.service';
import { makePrisma, mockUser } from '../test-utils';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let prisma: ReturnType<typeof makePrisma>;

  beforeEach(async () => {
    process.env.JWT_SECRET = 'test-secret';
    prisma = makePrisma();
    const module = await Test.createTestingModule({
      providers: [JwtStrategy, { provide: PrismaService, useValue: prisma }],
    }).compile();
    strategy = module.get(JwtStrategy);
  });

  it('returns the user from DB when payload is valid', async () => {
    const user = { id: 'user-1', email: 'test@email.com', role: 'USER' };
    prisma.user.findUnique.mockResolvedValue(user);

    const result = await strategy.validate({
      sub: 'user-1',
      email: 'test@email.com',
      role: 'USER',
    });
    expect(result).toEqual(user);
  });

  it('throws UnauthorizedException when user no longer exists', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    await expect(
      strategy.validate({ sub: 'gone', email: 'x@x.com', role: 'USER' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('throws at construction when JWT_SECRET is missing', () => {
    delete process.env.JWT_SECRET;
    expect(
      () => new JwtStrategy({ user: { findUnique: jest.fn() } } as any),
    ).toThrow('[FATAL] JWT_SECRET is not set');
  });
});
