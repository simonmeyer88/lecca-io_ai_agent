import { IsBoolean, IsOptional } from 'class-validator';

export class CreditIncludeTypeDto {
  @IsOptional()
  @IsBoolean()
  all?: boolean;
}
