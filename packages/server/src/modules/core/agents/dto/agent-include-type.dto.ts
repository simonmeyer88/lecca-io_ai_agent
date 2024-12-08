import { IsBoolean, IsOptional } from 'class-validator';

export class AgentIncludeTypeDto {
  @IsOptional()
  @IsBoolean()
  all?: boolean;
}
