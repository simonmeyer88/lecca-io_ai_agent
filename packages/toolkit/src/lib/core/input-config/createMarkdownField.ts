import { BaseFieldConfig, FieldConfig } from '../../types/input-config.types';

export function createMarkdownField(
  args: CreateMarkdownFieldArgs,
): FieldConfig {
  return {
    ...args,
    inputType: 'markdown',
    label: '',
    description: '',
    markdown: args.markdown,
  };
}

export type CreateMarkdownFieldArgs = Pick<BaseFieldConfig, 'id'> & {
  markdown: string;
};
