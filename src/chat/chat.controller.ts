import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Query, 
  UseGuards, 
  HttpCode 
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateMessageDto, GetChatHistoryDto } from './chat.dto';
import { JwtGuard } from 'src/auth/jwt.guard';
import { CurrentUser } from 'src/auth/current-user.decorator';

@UseGuards(JwtGuard) // Protects all chat routes - must be logged in
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  /**
   * POST /chat
   * Sends a new message.
   */
  @Post()
  @HttpCode(201)
  async sendMessage(
    @CurrentUser() user: { id: string },
    @Body() dto: CreateMessageDto,
  ) {
    return this.chatService.sendMessage(user.id, dto);
  }

  /**
   * GET /chat
   * Retrieves paginated chat history using limit and cursor.
   */
  @Get()
  @HttpCode(200)
  async getHistory(@Query() query: GetChatHistoryDto) {
    return this.chatService.getHistory(query);
  }
}