import { WebSocketGateway, WebSocketServer, SubscribeMessage, ConnectedSocket, MessageBody } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../../prisma/prisma.service';

@WebSocketGateway({ cors: true })
export class ChatGateway {
  @WebSocketServer()
  server!: Server;

  constructor(private prisma: PrismaService) {}

  //check to make sure both users tokens are correct 
  //before be even begin to connct.
  handleConnection(client: Socket) {
    const token = client.handshake.auth.token;
    if (!token) {
      client.disconnect(); // Kick them out!
    }
  }

  //walkie talkie function between frontend
  //Puts user and agent in private room together via ticket number
  //display userID on console log for tessttttt
@SubscribeMessage('joinTicket')
  handleJoinTicket(
    @MessageBody() data: { ticketId: string; userId: string }, 
    @ConnectedSocket() client: Socket
  ) {
    client.join(data.ticketId); 
    console.log(`User ${data.userId} joined the private room for Ticket: ${data.ticketId}`);
  }

  //Save message to prismaa then relay messsage to the chat room.
  @SubscribeMessage('sendMessage')
  async handleSendMessage(@MessageBody() data: { ticketId: string; senderId: string; content: string }) {
    
    // Save to prisma
    const savedMessage = await this.prisma.message.create({
      data: {
        content: data.content,
        senderId: data.senderId,
        ticketId: data.ticketId,
      },
      include: { sender: true } 
    });

    // relay only to priv room via ticketID 
    this.server.to(data.ticketId).emit('newMessage', savedMessage);
  }
}