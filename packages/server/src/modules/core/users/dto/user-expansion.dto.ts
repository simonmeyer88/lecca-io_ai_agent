import { IsBoolean, IsOptional } from 'class-validator';

export class UserExpansionDto {
  @IsOptional()
  @IsBoolean()
  createdAt?: boolean;

  @IsOptional()
  @IsBoolean()
  updatedAt?: boolean;

  @IsOptional()
  @IsBoolean()
  deletedAt?: boolean;

  @IsOptional()
  @IsBoolean()
  rootProfileImageUrl?: boolean;

  @IsOptional()
  @IsBoolean()
  emailVerifiedAt?: boolean;

  @IsOptional()
  @IsBoolean()
  toursCompleted?: boolean;
}
