import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

import { VariableDataType } from '../enums/variable-data-type.enum';
import { VariableType } from '../enums/variable-type.enum';

export class CreateVariableDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description: string;

  @IsEnum(VariableType)
  type!: VariableType;

  @IsEnum(VariableDataType)
  dataType!: VariableDataType;

  @IsOptional()
  @IsString()
  projectId?: string;

  //Even though we store these as Json in the db, we want to validate them as strings
  @IsString()
  value!: any;
}
