import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Apply this guard to any route you want to protect.
 *
 * Usage on a single endpoint:
 *   @UseGuards(JwtGuard)
 *   @Get('/protected')
 *   someRoute() { ... }
 *
 * Usage on an entire controller:
 *   @UseGuards(JwtGuard)
 *   @Controller('tickets')
 *   export class TicketController { ... }
 */
@Injectable()
export class JwtGuard extends AuthGuard('jwt') {}
