import { IsString } from 'class-validator';

export class BetaKeyDto {
  @IsString()
  betaKey?: string;
}
