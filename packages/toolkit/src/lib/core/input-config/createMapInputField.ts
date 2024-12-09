import { BaseFieldConfig, FieldConfig } from '../../types/input-config.types';

export function createMapInputField(
  args: CreateMapInputFieldArgs,
): FieldConfig {
  return {
    ...args,
    inputType: 'map',
  };
}

export type CreateMapInputFieldArgs = Omit<BaseFieldConfig, 'inputType'> &
  Pick<FieldConfig, 'mapOptions'>;
