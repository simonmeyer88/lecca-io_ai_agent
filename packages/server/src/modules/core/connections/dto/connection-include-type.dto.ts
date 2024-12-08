import { IsBoolean, IsOptional } from 'class-validator';

export class ConnectionIncludeTypeDto {
  @IsOptional()
  @IsBoolean()
  all?: boolean;
}
