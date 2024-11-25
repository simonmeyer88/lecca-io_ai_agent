import { IsString, IsDefined, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateWorkspaceDto {
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsString()
  logoUrl?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
