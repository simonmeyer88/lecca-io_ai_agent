import { BaseFieldConfig, FieldConfig } from '../../types/input-config.types';

export function createDynamicMultiSelectInputField(
  args: CreateDynamicMultiSelectInputFieldArgs,
): FieldConfig {
  return {
    ...args,
    inputType: 'dynamic-multi-select',
  };
}

export type CreateDynamicMultiSelectInputFieldArgs = Omit<
  BaseFieldConfig,
  'inputType'
> &
  Pick<FieldConfig, 'selectOptions'> &
  Required<Pick<FieldConfig, '_getDynamicValues'>>;
