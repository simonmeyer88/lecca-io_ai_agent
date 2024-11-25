import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class VerifyUserEmailDto {
  @IsNotEmpty()
  @IsString()
  emailVerifiedAt!: string;

  @IsOptional()
  emailVerificationToken!: null;

  @IsOptional()
  emailVerificationTokenExpiresAt!: null;
}
