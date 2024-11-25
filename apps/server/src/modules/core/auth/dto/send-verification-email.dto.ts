import { IsNotEmpty, IsString } from 'class-validator';

export class SendVerificationEmailDto {
  @IsString()
  @IsNotEmpty()
  email: string;
}
