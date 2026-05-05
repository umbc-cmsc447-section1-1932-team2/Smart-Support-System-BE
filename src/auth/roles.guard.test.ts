import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { RolesGuard } from './roles.guard';

const makeContext = (user: unknown) =>
  ({
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
  }) as unknown as ExecutionContext;

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: jest.Mocked<Reflector>;

  beforeEach(() => {
    reflector = { getAllAndOverride: jest.fn() } as any;
    guard = new RolesGuard(reflector);
  });

  afterEach(() => jest.restoreAllMocks());

  it('allows access when no roles are required', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);
    expect(guard.canActivate(makeContext(null))).toBe(true);
  });

  it('allows access when user has the required role', () => {
    reflector.getAllAndOverride.mockReturnValue([Role.ADMIN]);
    expect(guard.canActivate(makeContext({ role: Role.ADMIN }))).toBe(true);
  });

  it('throws ForbiddenException when user has insufficient role', () => {
    reflector.getAllAndOverride.mockReturnValue([Role.ADMIN]);
    expect(() => guard.canActivate(makeContext({ role: Role.USER }))).toThrow(ForbiddenException);
  });

  it('throws ForbiddenException when there is no user on the request', () => {
    reflector.getAllAndOverride.mockReturnValue([Role.ADMIN]);
    expect(() => guard.canActivate(makeContext(null))).toThrow(ForbiddenException);
  });

  it('allows access when user matches one of multiple required roles', () => {
    reflector.getAllAndOverride.mockReturnValue([Role.ADMIN, Role.AGENT]);
    expect(guard.canActivate(makeContext({ role: Role.AGENT }))).toBe(true);
  });
});
