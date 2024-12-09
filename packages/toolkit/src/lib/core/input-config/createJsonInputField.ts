import { BaseFieldConfig, FieldConfig } from '../../types/input-config.types';

export function createJsonInputField(
  args: CreateJsonInputFieldArgs,
): FieldConfig {
  return {
    ...args,
    inputType: 'json',
  };
}

export type CreateJsonInputFieldArgs = Omit<BaseFieldConfig, 'inputType'>;
