import { IsOptional, IsString } from 'class-validator';

export class AgentFilterByDto {
  @IsOptional()
  @IsString()
  projectId?: string;
}
