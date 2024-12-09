import { BaseFieldConfig, FieldConfig } from '../../types/input-config.types';

export function createTextInputField(
  args: CreateTextInputFieldArgs,
): FieldConfig {
  return {
    ...args,
    inputType: 'text',
  };
}

export type CreateTextInputFieldArgs = Omit<BaseFieldConfig, 'inputType'>;
