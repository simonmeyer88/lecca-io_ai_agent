import { BaseFieldConfig, FieldConfig } from '../../types/input-config.types';

export function createNumberInputField(
  args: CreateNumberInputFieldArgs,
): FieldConfig {
  return {
    ...args,
    inputType: 'number',
  };
}

export type CreateNumberInputFieldArgs = Omit<BaseFieldConfig, 'inputType'> &
  Pick<FieldConfig, 'numberOptions'>;
