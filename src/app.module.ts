import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ChatGateway } from './chat/chat.gateway';
import { TicketModule } from './ticket/ticket.module';

@Module({
  imports: [UserModule, AuthModule, TicketModule],
  controllers: [AppController],
  providers: [AppService,
              ChatGateway]
})
export class AppModule {}
