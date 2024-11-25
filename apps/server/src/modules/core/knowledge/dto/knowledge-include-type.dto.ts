import { IsBoolean, IsOptional } from 'class-validator';

export class KnowledgeIncludeTypeDto {
  @IsOptional()
  @IsBoolean()
  all?: boolean;
}
