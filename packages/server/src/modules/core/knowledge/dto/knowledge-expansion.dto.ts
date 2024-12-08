import { IsBoolean, IsOptional } from 'class-validator';

export class KnowledgeExpansionDto {
  @IsOptional()
  @IsBoolean()
  description?: boolean;

  @IsOptional()
  @IsBoolean()
  createdAt?: boolean;

  @IsOptional()
  @IsBoolean()
  updatedAt?: boolean;

  @IsOptional()
  @IsBoolean()
  workspace?: boolean;

  @IsOptional()
  @IsBoolean()
  project?: boolean;

  @IsOptional()
  @IsBoolean()
  indexName?: boolean;

  @IsOptional()
  @IsBoolean()
  chunkSize?: boolean;

  @IsOptional()
  @IsBoolean()
  chunkOverlap?: boolean;

  @IsOptional()
  @IsBoolean()
  usage?: boolean;

  @IsOptional()
  @IsBoolean()
  vectorRefs?: boolean;

  @IsOptional()
  @IsBoolean()
  countVectorRefs?: boolean;

  @IsOptional()
  @IsBoolean()
  embeddingProvider?: boolean;

  @IsOptional()
  @IsBoolean()
  embeddingModel?: boolean;

  @IsOptional()
  @IsBoolean()
  dimensions?: boolean;
}
