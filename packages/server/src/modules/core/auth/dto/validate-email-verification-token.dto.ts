import { IsNotEmpty, IsString } from 'class-validator';

export class ValidateEmailVerificationTokenDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsString()
  @IsNotEmpty()
  email: string;
}
