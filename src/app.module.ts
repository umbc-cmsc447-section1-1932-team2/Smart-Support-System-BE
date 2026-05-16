import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ChatModule } from './chat/chat.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { TicketModule } from './ticket/ticket.module';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [UserModule, AuthModule, TicketModule, ChatModule, EventEmitterModule.forRoot()],
  controllers: [AppController],
  providers: [AppService,
              ]
})
export class AppModule {}
