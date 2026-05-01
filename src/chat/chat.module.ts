import { Module, forwardRef } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { TicketModule } from '../ticket/ticket.module';

/*
The ChatModule uses forwardRef to import TicketModule, preventing circular dependency loops.
ChatGateway is registered as a provider and exported, allowing TicketService to inject it.
*/

@Module({
  imports: [forwardRef(() => TicketModule)],
  providers: [ChatGateway],
  exports: [ChatGateway], 
})
export class ChatModule {}