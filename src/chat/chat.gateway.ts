import { 
  WebSocketGateway, 
  WebSocketServer, 
  SubscribeMessage, 
  ConnectedSocket, 
  MessageBody 
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { OnEvent } from '@nestjs/event-emitter'; // 1. IMPORT THIS

@WebSocketGateway({
  cors: {
    origin: '*', 
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
export class ChatGateway {
  @WebSocketServer()
  server!: Server;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService 
  ) {}


  //check token
  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token;
      if (!token) throw new Error('No token');
      const payload = await this.jwtService.verifyAsync(token);
      client.data.user = payload; 
      console.log(`User ${payload.sub} connected to websockets`);
    } catch (err) {
      client.disconnect();
    }
  }

  
    // listens for 'ticket.created' from TicketService
    //relays 'newTicketAlert' to all agents browsers
   
  @OnEvent('ticket.created')
  handleTicketCreated(payload: any) {
    this.server.emit('newTicketAlert', payload);
    console.log('Broadcast: New ticket added to the Global Queue');
  }

  
   //listens for 'ticket.claimed' from TicketService
   // browsers to remove the ticket from the "Unassigned" list
   
  @OnEvent('ticket.claimed')
  handleTicketClaimed(payload: { ticketId: string; agentId: string }) {
    this.server.emit('ticketClaimed', payload);
    console.log(`📢 Broadcast: Ticket ${payload.ticketId} claimed by Agent ${payload.agentId}`);
  }


  

  @SubscribeMessage('joinTicket')
  handleJoinTicket(
    @MessageBody() data: { ticketId: string; userId: string }, 
    @ConnectedSocket() client: Socket
  ) {
    client.join(data.ticketId); 
    console.log(`👤 User ${data.userId} joined Room: ${data.ticketId}`);
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody() data: { ticketId: string; senderId: string; content: string } 
  ) {
    try {
      const savedMessage = await this.prisma.message.create({
        data: {
          content: data.content,
          senderId: data.senderId,
          ticketId: data.ticketId, 
        },
        include: { 
          sender: { select: { id: true, username: true } } 
        } 
      });

      this.server.to(data.ticketId).emit('newMessage', savedMessage);
    } catch (error) {
      console.error("Error Saving", error);
    }
  }

  @SubscribeMessage('triggerDashboardUpdate')
  handleDashboardUpdate() {
    this.server.emit('refreshData'); 
  }

}