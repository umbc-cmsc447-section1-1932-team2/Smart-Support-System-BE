import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { sendResponse } from 'src/utils/responses.dto';
import { CreateTicketDto, UpdateTicketDto, AssignTicketDto } from './ticket.dto';
import { Role } from '@prisma/client';

@Injectable()
export class TicketService {
  constructor(private prisma: PrismaService) {}


  /**
   * Create a new ticket — any logged in user can do this.
   * The createdById is taken from the JWT token
   */
  createTicket = async (dto: CreateTicketDto, userId: string) => {
    const ticket = await this.prisma.ticket.create({
      data: {
        title: dto.title,
        description: dto.description,
        status: dto.status ?? 'OPEN',
        createdById: userId,
      },
    });
    return sendResponse('Ticket created successfully', ticket);
  };


  /**
   * Get all tickets (Agent and Admin only).
   */
  getAllTickets = async () => {
    const tickets = await this.prisma.ticket.findMany({
      include: {
        createdBy: {
          select: { id: true, username: true, email: true, role: true },
        },
        assignedTo: {
          select: { id: true, username: true, email: true, role: true },
        },
      },
    });
    return sendResponse('All tickets fetched successfully', tickets);
  };


  /**
   * Get only the tickets created by the logged in user — USER role.
   */
  getMyTickets = async (userId: string) => {
    const tickets = await this.prisma.ticket.findMany({
      where: { createdById: userId },
      include: {
        assignedTo: {
          select: { id: true, username: true, email: true },
        },
      },
    });
    return sendResponse('Your tickets fetched successfully', tickets);
  };


  /**
 * Get all tickets assigned to the logged in agent or admin.
 * This is is for the agent/admin windows for viewing their
 * assigned tickets instead of the tickets they've created
 */
getAssignedTickets = async (userId: string) => {
  const tickets = await this.prisma.ticket.findMany({
    where: { assignedToId: userId },
    include: {
      createdBy: {
        select: { id: true, username: true, email: true },
      },
    },
  });
  return sendResponse('Assigned tickets fetched successfully', tickets);
};


  /**
   * Get a single ticket by ID.
   * Users can only view their own tickets.
   * Agents and admins can view any ticket.
   */
  getTicketById = async (ticketId: string, userId: string, userRole: Role) => {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        createdBy: {
          select: { id: true, username: true, email: true, role: true },
        },
        assignedTo: {
          select: { id: true, username: true, email: true, role: true },
        },
      },
    });

    if (!ticket) throw new NotFoundException('Ticket not found');

    // Regular users can only see their own tickets
    if (userRole === Role.USER && ticket.createdById !== userId) {
      throw new ForbiddenException('Not Authorized');
    }

    return sendResponse('Ticket fetched successfully', ticket);
  };

  /**
   * Update the ticket title, description, or status.
   * Only agents and admins have priv here
   */
  updateTicket = async (ticketId: string, dto: UpdateTicketDto) => {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
    });
    if (!ticket) throw new NotFoundException('Ticket not found');

    const updated = await this.prisma.ticket.update({
      where: { id: ticketId },
      data: { ...dto },
    });
    return sendResponse('Ticket updated successfully', updated);
  };

  /**
   * Assign an agent or admin to a ticket — ADMIN only.
   * Validates that the assignee is actually an AGENT or ADMIN.
   * Will need an auto assign feature or something later maybe
   */
  assignTicket = async (ticketId: string, dto: AssignTicketDto) => {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
    });
    if (!ticket) throw new NotFoundException('Ticket not found');

    const agent = await this.prisma.user.findUnique({
      where: { id: dto.agentId },
    });
    if (!agent) throw new NotFoundException('User not found');

    // Enforce that only AGENT or ADMIN can be assigned
    if (agent.role === Role.USER) {
      throw new BadRequestException(
        'Only agents or admins can be assigned to tickets',
      );
    }

    const updated = await this.prisma.ticket.update({
      where: { id: ticketId },
      data: { assignedToId: dto.agentId },
    });
    return sendResponse('Ticket assigned successfully', updated);
  };

  /**
   * Delete a ticket — ADMIN only.
   */
  deleteTicket = async (ticketId: string) => {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
    });
    if (!ticket) throw new NotFoundException('Ticket not found');

    await this.prisma.ticket.delete({ where: { id: ticketId } });
    return sendResponse('Ticket deleted successfully', {});
  };
}
