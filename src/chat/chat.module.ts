import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt'; 
import { ChatGateway } from './chat.gateway';
import { TicketModule } from '../ticket/ticket.module';

@Module({
  imports: [
JwtModule.registerAsync({
  useFactory: () => ({
    secret: process.env.JWT_SECRET,
    signOptions: { expiresIn: '1d' },
  }),
}),
    forwardRef(() => TicketModule)
  ],
  providers: [ChatGateway],
  exports: [ChatGateway], 
})
export class ChatModule {}