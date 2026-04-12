import { createParamDecorator, ExecutionContext } from "@nestjs/common";


/*
* When a request is made, CurrentUser is populated from
* the user information making the request. Utilized after
* the roles.guard authorizes user access, simplifies
* 
* 
* To use in a relevant controller, following code is needed
* 
*   @Get('/me')
*   getMe(@CurrentUser() user) {
*     console.log(user.id, user.email, user.role);
*   }
*/
export const CurrentUser = createParamDecorator (

    (data: unknown, ctx: ExecutionContext) => {

        const request = ctx.switchToHttp().getRequest();
        return request.user;
    },
);
