import { Role } from '@prisma/client';

export const mockUser = (overrides = {}) => ({
  id: 'user-1',
  username: 'testuser',
  email: 'test@email.com',
  password: '$2b$10$hashedpassword',
  phone: null,
  role: Role.USER,
  ...overrides,
});

export const makePrisma = () => ({
  user: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
  },
});

export const makeJwtService = () => ({
  sign: jest.fn().mockReturnValue('test.access.token'),
});
