import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateMessageDto, GetChatHistoryDto } from './chat.dto';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  /**
   * POST Logic: Save a new message
   */
  async sendMessage(userId: string, dto: CreateMessageDto) {
    return this.prisma.message.create({
      data: {
        content: dto.content,
        receiverId: dto.receiverId,
        senderId: userId, // From the JWT/CurrentUser
      },
      include: {
        sender: { select: { name: true } }, // Optional: return sender name for the UI
      },
    });
  }

  /**
   * GET Logic: Retrieve history with Cursor Pagination
   */
  async getHistory(query: GetChatHistoryDto) {
    const { limit, cursor } = query;

    return this.prisma.message.findMany({
      take: limit,
      skip: cursor ? 1 : 0, // Skip the cursor itself if it exists
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: {
        createdAt: 'desc', // Most recent messages first
      },
    });
  }
}