import { BaseFieldConfig, FieldConfig } from '../../types/input-config.types';

export function createDateRangeInputField(
  args: CreateDateRangeInputFieldArgs,
): FieldConfig {
  return {
    ...args,
    inputType: 'date-range',
  };
}

export type CreateDateRangeInputFieldArgs = Omit<BaseFieldConfig, 'inputType'>;
