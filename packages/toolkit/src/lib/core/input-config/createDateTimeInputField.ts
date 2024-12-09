import { BaseFieldConfig, FieldConfig } from '../../types/input-config.types';

export function createDateTimeInputField(
  args: CreateDateTimeInputFieldArgs,
): FieldConfig {
  return {
    ...args,
    inputType: 'date-time',
  };
}

export type CreateDateTimeInputFieldArgs = Omit<BaseFieldConfig, 'inputType'>;
