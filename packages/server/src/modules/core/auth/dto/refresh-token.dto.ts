import { IsDefined, IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  refreshToken: string;
}
