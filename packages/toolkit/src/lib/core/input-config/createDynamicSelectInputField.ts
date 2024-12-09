import { BaseFieldConfig, FieldConfig } from '../../types/input-config.types';

export function createDynamicSelectInputField(
  args: CreateDynamicSelectInputFieldArgs,
): FieldConfig {
  return {
    ...args,
    inputType: 'dynamic-select',
  };
}

export type CreateDynamicSelectInputFieldArgs = Omit<
  BaseFieldConfig,
  'inputType'
> &
  Pick<FieldConfig, 'selectOptions'> &
  Required<Pick<FieldConfig, '_getDynamicValues'>>;
