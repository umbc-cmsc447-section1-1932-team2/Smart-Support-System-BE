import { 
  Injectable, 
  NotFoundException, 
  BadRequestException, 
  ForbiddenException 
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from 'prisma/prisma.service';
import { Role, TicketStatus } from '@prisma/client';
import { CreateTicketDto, UpdateTicketDto, AssignTicketDto } from './ticket.dto';

@Injectable()
export class TicketService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2, 
  ) {}

  // helper function
  private get standardInclude() {
    return {
      createdBy: {
        select: { id: true, username: true, email: true },
      },
      assignedTo: {
        select: { id: true, username: true, email: true },
      },
    };
  }


async getAllTickets() {
    return this.prisma.ticket.findMany({
      include: this.standardInclude, 
      orderBy: { createdAt: 'desc' },
    });
  }
  
  async getMyTickets(userId: string) {
    return this.prisma.ticket.findMany({
      where: { createdById: userId },
      include: this.standardInclude,
      orderBy: { createdAt: 'desc' },
    });
  }


  // saves to DB and alerts agents via Event Emitter
   
  async createTicket(dto: CreateTicketDto, userId: string) {
    const ticket = await this.prisma.ticket.create({
      data: {
        title: dto.title,
        description: dto.description,
        status: TicketStatus.OPEN, // Enum
        createdById: userId,
      },
      include: this.standardInclude,
    });

    // notify gateway that a new ticket has been added to Global Queue
    this.eventEmitter.emit('ticket.created', ticket);

    return ticket;
  }

  // Global support tab, only returns unassigned OPEN tickets
   
  async getQueue() {
    return this.prisma.ticket.findMany({
      where: {
        assignedToId: null,
        status: TicketStatus.OPEN,
      },
      include: this.standardInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  // Updates status and alerts agents to remove from their queue
   
  async assignTicket(ticketId: string, dto: AssignTicketDto) {
    const ticket = await this.prisma.ticket.findUnique({ where: { id: ticketId } });
    if (!ticket) throw new NotFoundException('Ticket not found');
    if (ticket.assignedToId) throw new BadRequestException('Ticket already claimed');

    const updatedTicket = await this.prisma.ticket.update({
      where: { id: ticketId },
      data: {
        assignedToId: dto.agentId, // Extract the ID from the DTO
        status: TicketStatus.IN_PROGRESS,
      },
      include: this.standardInclude,
    });

    this.eventEmitter.emit('ticket.claimed', { ticketId, agentId: dto.agentId });

    return updatedTicket;
  }

  
   // Get ticket by ID
   // includes message history for chat
   
  async getTicketById(ticketId: string, userId: string, userRole: Role) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        ...this.standardInclude,
        messages: {
          orderBy: { createdAt: 'asc' },
          include: {
            sender: { select: { id: true, username: true } },
          },
        },
      },
    });

    if (!ticket) throw new NotFoundException('Ticket not found');

    
    if (userRole === Role.USER && ticket.createdById !== userId) {
      throw new ForbiddenException('Not authorized to view this ticket');
    }

    return ticket;
  }

 
  async getAssignedTickets(agentId: string) {
    return this.prisma.ticket.findMany({
      where: { assignedToId: agentId },
      include: this.standardInclude,
      orderBy: { updatedAt: 'desc' },
    });
  }

  // update/ddelte tickets 
   
  async updateTicket(ticketId: string, dto: UpdateTicketDto) {
    return this.prisma.ticket.update({
      where: { id: ticketId },
      data: dto,
      include: this.standardInclude,
    });
  }

  async deleteTicket(ticketId: string) {
    return this.prisma.ticket.delete({ where: { id: ticketId } });
  }
}