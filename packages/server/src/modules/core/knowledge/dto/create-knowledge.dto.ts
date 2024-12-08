import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateKnowledgeDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;

  @IsNumber()
  @IsOptional()
  chunkOverlap?: number;

  @IsNumber()
  @IsOptional()
  chunkSize?: number;

  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @IsString()
  embeddingModel?: string;

  @IsOptional()
  @IsString()
  embeddingProvider?: string;

  @IsOptional()
  @IsInt()
  dimensions?: number;
}
