import { IsObject } from 'class-validator';

export class ManuallyRunWorkflowInputDataDto {
  @IsObject()
  inputData: Record<string, any>;
}
