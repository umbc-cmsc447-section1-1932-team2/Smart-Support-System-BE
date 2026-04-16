import{
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException
} from '@nestjs/common';

import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {

        const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [

            context.getHandler(),
            context.getClass(),
        ]);
    

    //does the request require a role? If no, continue anyway
    if (!requiredRoles) return true;

    //check for proper role on user request
    const { user } = context.switchToHttp().getRequest();

    //error when user attempts to access priviledged route
    if (!requiredRoles.includes(user.role)) {

        throw new ForbiddenException('Access Denied');
    }

    return true;
    }
}
