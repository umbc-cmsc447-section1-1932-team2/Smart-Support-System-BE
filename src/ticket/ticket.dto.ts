import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { TicketStatus } from '@prisma/client';

export class CreateTicketDto {
  @IsString()
  @IsNotEmpty()
  title!: string; 

  @IsString()
  @IsNotEmpty()
  description!: string; 
  @IsOptional()
  @IsEnum(TicketStatus)
  status?: TicketStatus; 
}

export class UpdateTicketDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(TicketStatus)
  status?: TicketStatus;

  @IsOptional()
  @IsString()
  assignedToId?: string; 
}

export class AssignTicketDto {
  @IsString()
  @IsNotEmpty()
  agentId!: string; 
}