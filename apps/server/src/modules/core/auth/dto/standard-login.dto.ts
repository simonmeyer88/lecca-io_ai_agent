import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class StandardLoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
