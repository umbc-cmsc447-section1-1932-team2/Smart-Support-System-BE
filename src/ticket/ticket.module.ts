import { Module, forwardRef } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { TicketController } from './ticket.controller';
import { PrismaModule } from 'prisma/prisma.module';
import { ChatModule } from '../chat/chat.module';

/*
The TicketModule imports ChatModule via forwardRef to resolve the circular dependency with the chat gateway.
The PrismaModule is included to provide database access to the TicketService.
TicketService and TicketController are registered as the primary provider and controller for this module.
*/

@Module({
  imports: [
    PrismaModule,
    forwardRef(() => ChatModule), 
  ],
  providers: [TicketService],
  controllers: [TicketController],
  exports: [TicketService],
})
export class TicketModule {}