import {
  IsString,
  IsDefined,
  IsOptional,
  IsNotEmpty,
  IsEmail,
  IsArray,
} from 'class-validator';

export class CreateUserDto {
  @IsDefined()
  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  password?: string;

  @IsOptional()
  @IsString()
  rootProfileImageUrl?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  toursCompleted?: string[];
}
