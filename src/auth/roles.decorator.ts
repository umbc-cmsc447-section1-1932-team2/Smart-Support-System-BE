import { SetMetadata } from '@nestjs/common';

//this import is for type safety, must be a true Role to compare if a role = true
import { Role } from '@prisma/client';


//This is a key for NestJS to store and retreive the roles ENUMs, it is a field name
export const ROLES_KEY = 'roles'

/*when requests come in, this will decorate a call with metadata of the users role
* and will attach it to a field that NestJS can later use in authorization
* for the guard to retreive and validate.
*/
export const Roles = (...roles: Role[]) => {
    return SetMetadata(ROLES_KEY, roles)
};