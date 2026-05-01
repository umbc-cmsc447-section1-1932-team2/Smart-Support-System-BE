import {
  Injectable,
  Inject,
  forwardRef,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { sendResponse } from 'src/utils/responses.dto';
import { CreateTicketDto, UpdateTicketDto, AssignTicketDto } from './ticket.dto';
import { Role } from '@prisma/client';
import { ChatGateway } from '../chat/chat.gateway';

/*
The constructor utilizes forwardRef to prevent circular dependencies between the TicketService and ChatGateway.
The createTicket method now includes the createdBy relation and broadcasts a newTicketAlert to all agents via WebSockets.
The getAllTickets and getAssignedTickets methods are optimized to include creator details, ensuring the dashboard displays names instead of IDs.
The getTicketById method includes a chronological message history to support the ticket chat functionality.
*/

@Injectable()
export class TicketService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => ChatGateway))
    private readonly chatGateway: ChatGateway,
  ) {}

  /**
   * Create a new ticket and broadcast it to agents immediately.
   */
  createTicket = async (dto: CreateTicketDto, userId: string) => {
    const ticket = await this.prisma.ticket.create({
      data: {
        title: dto.title,
        description: dto.description,
        status: dto.status ?? 'OPEN',
        createdById: userId,
      },
      include: {
        createdBy: {
          select: { id: true, username: true, email: true },
        },
      },
    });

    // Broadcast the new ticket so the Agent Dashboard updates without a refresh
    if (this.chatGateway?.server) {
      this.chatGateway.server.emit('newTicketAlert', ticket);
    }

    return sendResponse('Ticket created successfully', ticket);
  };

  /**
   * Used for the "Support Queue" tab.
   * Returns all tickets that are NOT yet assigned to an agent.
   */
getQueue = async () => {
  const tickets = await this.prisma.ticket.findMany({
    where: {
      assignedToId: null,
      status: 'OPEN', // Ensure we only show active, unassigned tickets
    },
    include: {
      createdBy: {
        select: { id: true, username: true, email: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return sendResponse('Queue fetched successfully', tickets);
};
  /**
   * Get all tickets (Agent and Admin only).
   */
  getAllTickets = async () => {
    return await this.prisma.ticket.findMany({
      include: {
        createdBy: {
          select: { id: true, username: true, email: true, role: true },
        },
        assignedTo: {
          select: { id: true, username: true, email: true, role: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  };

  /**
   * Get tickets created by the logged-in user.
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
   * Used for the "My Active Chats" tab.
   */
getAssignedTickets = async (agentId: string) => {
  const tickets = await this.prisma.ticket.findMany({
    where: {
      assignedToId: agentId,
    },
    include: {
      createdBy: {
        select: { id: true, username: true, email: true },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });
  
  return sendResponse('Assigned tickets fetched successfully', tickets);
};
  /**
   * Get a single ticket with full message history.
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
        messages: {
          orderBy: { createdAt: 'asc' },
          include: {
            sender: {
              select: { id: true, username: true },
            },
          },
        },
      },
    });

    if (!ticket) throw new NotFoundException('Ticket not found');

    if (userRole === Role.USER && ticket.createdById !== userId) {
      throw new ForbiddenException('Not Authorized');
    }

    return sendResponse('Ticket fetched successfully', ticket);
  };

  /**
   * Update ticket status or details.
   */
  updateTicket = async (ticketId: string, dto: UpdateTicketDto) => {
    console.log("📥 Data received at Service:", dto);

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
   * Assign an agent to a ticket.
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

    if (agent.role === Role.USER) {
      throw new BadRequestException('Only agents or admins can be assigned to tickets');
    }

    const updated = await this.prisma.ticket.update({
      where: { id: ticketId },
      data: { 
        assignedToId: dto.agentId,
        status: 'IN_PROGRESS' // Auto-move to in progress when claimed
      },
    });
    return sendResponse('Ticket assigned successfully', updated);
  };

  /**
   * Delete a ticket.
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