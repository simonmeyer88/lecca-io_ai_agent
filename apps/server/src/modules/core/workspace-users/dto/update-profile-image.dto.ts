import { IsString } from 'class-validator';

export class UpdateProfileImageDto {
  @IsString()
  fileName?: string;
}
