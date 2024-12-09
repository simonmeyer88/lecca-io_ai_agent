import { BaseFieldConfig, FieldConfig } from '../../types/input-config.types';

export function createSwitchInputField(
  args: CreateSwitchInputFieldArgs,
): FieldConfig {
  return {
    ...args,
    inputType: 'switch',
  };
}

export type CreateSwitchInputFieldArgs = Omit<BaseFieldConfig, 'inputType'> &
  Required<Pick<FieldConfig, 'switchOptions'>>;
