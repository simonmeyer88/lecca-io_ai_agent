import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class RunNodeDto {
  @IsString()
  workflowId: string;

  @IsString()
  nodeId: string;

  @IsOptional()
  @IsBoolean()
  shouldMock?: boolean;

  //For triggers only
  @IsOptional()
  @IsBoolean()
  skipValidatingConditions?: boolean;
}
