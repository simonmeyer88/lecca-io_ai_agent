import { IsNotEmpty, IsString } from 'class-validator';

export class SendForgotPasswordEmailDto {
  @IsString()
  @IsNotEmpty()
  email: string;
}
