import {
Body,
Controller,
Delete,
Get,
HttpCode,
Param,
Patch,
Post,
UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtGuard } from 'src/auth/jwt.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { TicketService } from './ticket.service';
import { AssignTicketDto, CreateTicketDto, UpdateTicketDto } from './ticket.dto';
import { asyncWrapper } from 'src/utils/helper';

@UseGuards(JwtGuard, RolesGuard) // applies to every route in this controller
@Controller('ticket')
export class TicketController {
constructor(private readonly ticketService: TicketService) { }

/**
 * POST /ticket
 * Any logged in user can open a ticket.
 * createdById is pulled from the JWT token via @CurrentUser.
 */
@Post('/')
@HttpCode(201)
async createTicket(
  @Body() dto: CreateTicketDto,
  @CurrentUser() user: { id: string },
) {
  return asyncWrapper(() => this.ticketService.createTicket(dto, user.id));
}

/**
 * GET /ticket
 * Only Agent and Admin can see all tickets.
 */
@Roles(Role.AGENT, Role.ADMIN)
@HttpCode(200)
@Get('/')
async getAllTickets() {
  return asyncWrapper(() => this.ticketService.getAllTickets());
}


/**
* GET /ticket/me
* User sees only their own tickets.
*/
@Roles(Role.USER)
@HttpCode(200)
@Get('/me')
async getMyTickets(@CurrentUser() user: { id: string }) {
  return asyncWrapper(() => this.ticketService.getMyTickets(user.id));
}


/**
* GET /ticket/assigned
* Admin and Admin see all tickets assigned to them.
*/
@Roles(Role.AGENT, Role.ADMIN)
@HttpCode(200)
@Get('/assigned')
async getAssignedTickets(@CurrentUser() user: { id: string }) {
  return asyncWrapper(() => this.ticketService.getAssignedTickets(user.id));
}


/**
* GET /ticket/:id
* Any logged in user can attempt this — service layer enforces ownership for USERs.
*/
@HttpCode(200)
  @Get('/:id')
  async getTicketById(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; role: Role },
  ) {
    return asyncWrapper(() =>
      this.ticketService.getTicketById(id, user.id, user.role),
    );
  }


/**
 * PATCH /ticket/:id
 * Agent and Admin can update title, description, status.
 */
@Roles(Role.AGENT, Role.ADMIN)
@HttpCode(200)
@Patch('/:id')
async updateTicket(@Param('id') id: string, @Body() dto: UpdateTicketDto) {
  return asyncWrapper(() => this.ticketService.updateTicket(id, dto));
}


/**
 * PATCH /ticket/:id/assign
 * ADMIN only can assign an agent to a ticket.
 */
@Roles(Role.ADMIN)
@HttpCode(200)
@Patch('/:id/assign')
async assignTicket(@Param('id') id: string, @Body() dto: AssignTicketDto) {
  return asyncWrapper(() => this.ticketService.assignTicket(id, dto));
}


/**
 * DELETE /ticket/:id
 * Admin only.
 */
@Roles(Role.ADMIN)
@HttpCode(200)
@Delete('/:id')
async deleteTicket(@Param('id') id: string) {
  return asyncWrapper(() => this.ticketService.deleteTicket(id));
}
}
