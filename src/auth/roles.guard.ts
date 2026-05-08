import {
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
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
            context.getHandler(), // Checks the specific @Get or @Post method
            context.getClass(),   // Checks the @Controller class level
        ]);
        if (!requiredRoles) return true;

        //find a place to verify 
        const { user } = context.switchToHttp().getRequest();

        // 🕵️ DEBUG LOGS - Check your NestJS Terminal for these!
        console.log('--- Roles Guard Debug ---');
        console.log('Target Route Roles:', requiredRoles);
        console.log('User Found on Request:', user ? 'YES' : 'NO');
        console.log('User Role:', user?.role);
        //check for verification here as well to prevent token automatically

        if (user && user.role !== Role.USER && user.verification !== "VERIFIED") {

            console.error('❌ GUARD CAUGHT UNVERIFIED TOKEN');
            throw new ForbiddenException('Account Must Be Approved By Admin');
        }

        if (!user || !requiredRoles.includes(user.role)) {
            console.error('❌ GUARD REJECTED REQUEST');
            throw new ForbiddenException('Access Denied');
        }

        return true;
    }
}