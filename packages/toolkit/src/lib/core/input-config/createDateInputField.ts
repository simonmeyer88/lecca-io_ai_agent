import { BaseFieldConfig, FieldConfig } from '../../types/input-config.types';

export function createDateInputField(
  args: CreateDateInputFieldArgs,
): FieldConfig {
  return {
    ...args,
    inputType: 'date',
  };
}

export type CreateDateInputFieldArgs = Omit<BaseFieldConfig, 'inputType'>;
