import {
  BaseFieldConfig,
  FieldConfig,
  NestedInputConfig,
} from '../../types/input-config.types';

export function createNestedFields(
  args: CreateNestedFieldsArgs,
): NestedInputConfig {
  return {
    ...args,
    inputConfig: args.fields,
    occurenceType: 'multiple',
  };
}

export type CreateNestedFieldsArgs = Omit<BaseFieldConfig, 'inputType'> & {
  fields: FieldConfig[];
};
