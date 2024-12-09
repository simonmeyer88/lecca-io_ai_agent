import { BaseFieldConfig, FieldConfig } from '../../types/input-config.types';

export function createMultiSelectInputField(
  args: CreateMultiSelectInputFieldArgs,
): FieldConfig {
  return {
    ...args,
    inputType: 'multi-select',
  };
}

export type CreateMultiSelectInputFieldArgs = Omit<
  BaseFieldConfig,
  'inputType'
> &
  Required<Pick<FieldConfig, 'selectOptions'>>;
