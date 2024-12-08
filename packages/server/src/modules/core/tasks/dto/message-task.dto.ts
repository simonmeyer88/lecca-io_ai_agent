import { Message } from 'ai/react';
import { IsArray, IsOptional } from 'class-validator';

export class MessageTaskDto {
  @IsArray()
  messages: Message[];

  @IsOptional()
  data?: {
    imageUrl?: string;
  };
}
