import { BaseFieldConfig, FieldConfig } from '../../types/input-config.types';

export function createSelectInputField(
  args: CreateSelectInputFieldArgs,
): FieldConfig {
  return {
    ...args,
    inputType: 'select',
  };
}

export type CreateSelectInputFieldArgs = Omit<BaseFieldConfig, 'inputType'> &
  Required<Pick<FieldConfig, 'selectOptions'>>;
