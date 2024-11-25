import { IsNumber, IsString, MaxLength, MinLength } from 'class-validator';

export class SaveUploadedTextToKnowledgeDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsString()
  @MinLength(1)
  text: string;

  @IsNumber()
  chunkOverlap: number;

  @IsNumber()
  chunkSize: number;
}
