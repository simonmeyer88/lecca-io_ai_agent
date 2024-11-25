import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class StandardSignupDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
