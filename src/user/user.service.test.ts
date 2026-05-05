import { Test } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserService } from './user.service';
import { PrismaService } from 'prisma/prisma.service';
import { makePrisma, mockUser } from '../test-utils';

jest.mock('bcrypt', () => ({ compare: jest.fn(), hash: jest.fn() }));

describe('UserService', () => {
  let service: UserService;
  let prisma: ReturnType<typeof makePrisma>;

  beforeEach(async () => {
    prisma = makePrisma();
    const module = await Test.createTestingModule({
      providers: [UserService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = module.get(UserService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('getAllUsers', () => {
    it('returns all users', async () => {
      const users = [
        mockUser(),
        mockUser({ id: 'user-2', email: 'test@gmail.com' }),
      ];
      prisma.user.findMany.mockResolvedValue(users);

      const result = await service.getAllUsers();

      expect(result.message).toBe('All users fetched successfully');
      expect(result.data).toEqual(users);
    });

    it('returns empty array when no users exist', async () => {
      prisma.user.findMany.mockResolvedValue([]);
      const result = await service.getAllUsers();
      expect(result.data).toEqual([]);
    });
  });

  describe('createUser', () => {
    it('creates user and returns data hiding password', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      jest.mocked(bcrypt.hash).mockResolvedValue('hashed_pw');
      prisma.user.create.mockResolvedValue(mockUser());

      const dto = {
        email: 'user@test.com',
        password: 'secure123',
        username: 'newuser',
      };
      const result = await service.createUser(dto);

      expect(result.message).toBe('User created successfully');
      expect(result.data).not.toHaveProperty('password');
      expect(result.data).toMatchObject({
        email: 'user@test.com',
        username: 'newuser',
      });
      expect(bcrypt.hash).toHaveBeenCalledWith('secure123', 10);
    });

    it('throws ConflictException when email is already taken', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser());
      await expect(
        service.createUser({
          email: 'test@email.com',
          password: 'password123',
        }),
      ).rejects.toThrow(ConflictException);
      expect(prisma.user.create).not.toHaveBeenCalled();
    });
  });
});
