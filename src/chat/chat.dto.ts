import { IsString, IsNotEmpty, IsUUID, MaxLength, IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateMessageDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000) // Prevent "wall of text" spam
  content: string;

  @IsUUID()
  @IsNotEmpty()
  receiverId: string;

  @IsOptional()
  @IsString()
  chatRoomId?: string; // Optional if it's a 1-on-1 DM
}

export class GetChatHistoryDto {
  @IsOptional()
  @Type(() => Number) // Converts string '20' from URL to number 20
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @IsUUID()
  cursor?: string; // For "load more" scrolling logic
}