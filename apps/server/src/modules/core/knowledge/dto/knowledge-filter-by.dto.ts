import { IsOptional, IsString } from 'class-validator';

export class KnowledgeFilterByDto {
  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @IsString()
  projectAccessId?: string;
}
