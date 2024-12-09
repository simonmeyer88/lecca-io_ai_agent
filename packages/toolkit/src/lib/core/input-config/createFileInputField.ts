import { BaseFieldConfig, FieldConfig } from '../../types/input-config.types';

export function createFileInputField(
  args: CreateFileInputFieldArgs,
): FieldConfig {
  return {
    ...args,
    inputType: 'file',
  };
}

export type CreateFileInputFieldArgs = Omit<BaseFieldConfig, 'inputType'>;
