import { BaseFieldConfig, FieldConfig } from '../../types/input-config.types';

export function createCodeInputField(
  args: CreateCodeInputFieldArgs,
): FieldConfig {
  return {
    ...args,
    inputType: 'code',
  };
}

export type CreateCodeInputFieldArgs = Omit<BaseFieldConfig, 'inputType'>;
