import { IsOptional, IsString } from 'class-validator';

export class GoogleLoginDto {
  @IsOptional()
  @IsString()
  clientId: string;

  @IsOptional()
  @IsString()
  client_id: string;

  @IsString()
  credential: string;

  @IsOptional()
  @IsString()
  select_by: string;

  @IsOptional()
  @IsString()
  g_csrf_token: string;
}
