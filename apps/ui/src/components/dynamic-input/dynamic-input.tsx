import { Node, mergeAttributes } from '@tiptap/core';
import Placeholder from '@tiptap/extension-placeholder';
import {
  EditorContent,
  NodeViewWrapper,
  ReactNodeViewRenderer,
  useEditor,
} from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { isValid } from 'date-fns';
import React, { useMemo } from 'react';
import { Node as ReactFlowNode, useReactFlow } from 'reactflow';

import useApiQuery from '@/api/use-api-query';
import { cn } from '@/utils/cn';

import { Icons } from '../icons';
import { Popover } from '../ui/popover';
import { Separator } from '../ui/separator';

import './dynamic-input.css';
import { ReferencesPopover } from './references-popover';

const TemplateVariable = Node.create({
  name: 'templateVariable',

  // Define how the node looks in the editor.
  group: 'inline',
  inline: true,
  selectable: false,
  atom: true,

  // Define the attributes your node will have.
  addAttributes() {
    return {
      variable: {
        default: null,
      },
      variableName: {
        default: null,
      },
      refType: {
        default: null,
      },
      variableId: {
        default: null,
      },
    };
  },

  // Define how this node is rendered. This is just a basic example.
  parseHTML() {
    return [
      {
        tag: 'span[data-template-variable]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(HTMLAttributes, { 'data-template-variable': '' }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(VariableComponent as any, {
      as: 'span',
      contentDOMElementTag: 'span',
      className: 'inline',
    });
  },

  // Add a command to easily insert template variables.
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  addCommands() {
    return {
      insertTemplateVariable:
        (options: any) =>
        ({ commands }: { commands: any }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
    };
  },
});

export function DynamicInput({
  onChange,
  defaultValue,
  placeholder,
  node,
  readOnly,
  className,
  hideReferences,
  editorRef,
  projectId,
  agentId,
}: {
  onChange: any;
  defaultValue: any;
  required: boolean;
  placeholder?: string;
  node: ReactFlowNode;
  readOnly?: boolean;
  className?: string;
  hideReferences?: boolean;
  editorRef?: React.RefObject<HTMLDivElement>;
  projectId: string;
  agentId: string | undefined;
}) {
  //Hate that I have to do this, but context doesn't have the project id, everything just uses useParams.

  const editor = useEditor({
    extensions: [
      StarterKit,
      TemplateVariable,
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: defaultValue ?? '',
    onUpdate: ({ editor }) => {
      // Get the current text content of the editor
      const text = editor.getText();

      onChange(editor.getJSON());

      // Use a regular expression to find all instances of the {{variable}} pattern
      const regex = /={{(\w+)}}/g;
      let match;

      // Start a new transaction
      let tr = editor.state.tr;

      while ((match = regex.exec(text)) !== null) {
        const [fullMatch, variableName] = match;

        // Find the position of the matched text
        const from = match.index + 1;
        const to = match.index + fullMatch.length + 1;

        // Replace the matched text with a node representing the variable
        const variableNode = editor.schema.nodes.templateVariable.create({
          variable: variableName,
        });

        // Replace from - 2 to account for the {{ and to + 2 to account for the }}
        tr = tr.replaceWith(from, to, variableNode);
      }

      // Check if any replacements were made
      if (!tr.steps.length) return;

      // Apply the transaction to the editor state
      editor.view.updateState(editor.state.apply(tr));
    },
    editable: !readOnly,
  });

  // useEffect(() => {
  //   if (defaultValue != null && editor != null) {
  //     //To avoid flushSync error of rendering content while editor is rendering already
  //     Promise.resolve().then(() => {
  //       editor.commands.setContent(defaultValue);
  //     });
  //   }
  //   //The defaultValue can't be a dependency because it's actually the field.value so it will reset this ever time we type
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [editor]);

  // Example function to add a template variable.
  const addVariable = ({
    variableId,
    variableName,
    refType,
  }: {
    variableId: string;
    variableName: string;
    refType: 'ref' | 'var';
  }) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    editor
      .chain()
      .focus()
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      .insertTemplateVariable({
        variable: `${refType}:${variableId}`,
        variableName,
        refType,
        variableId,
      })
      .run();
  };

  return (
    <Popover>
      <div className={cn('flex space-x-1 items-center relative', className)}>
        <EditorContent
          editor={editor}
          className={cn('w-full bg-background rounded-md', {
            'bg-muted': readOnly,
          })}
          ref={editorRef}
        />
        {projectId && !readOnly && (
          <>
            <Popover.Trigger>
              <Icons.plusCircled className="h-7 w-6 p-1 absolute right-1.5 top-1/2 -translate-y-1/2" />
            </Popover.Trigger>
            <ReferencesPopover
              node={node}
              hideReferences={hideReferences || !!agentId}
              addReferences={addVariable}
              projectId={projectId}
            />
          </>
        )}
      </div>
    </Popover>
  );
}

type NodeWithAttrs = Node & {
  attrs: {
    variable: `${`ref` | `var`}:${string}`;
    variableName: string;
    refType: 'ref' | 'var';
    variableId: string;
  };
};

const VariableComponent = ({ node }: { node: NodeWithAttrs }) => {
  const { refType } = node.attrs;

  return (
    <NodeViewWrapper className="inline">
      {refType === 'var' ? (
        <VariableRefTypeContent node={node} />
      ) : (
        <ReferenceRefTypeContent node={node} />
      )}
    </NodeViewWrapper>
  );
};

const VariableRefTypeContent = ({ node }: { node: NodeWithAttrs }) => {
  const { variableName } = node.attrs;
  const { data: variables, isLoading: isLoadingVariables } = useApiQuery({
    service: 'variables',
    method: 'getList',
    apiLibraryArgs: {},
  });

  const variable = useMemo(() => {
    if (!variables) return null;

    const foundVariable = variables.find(
      (variable) => variable.id === node.attrs.variableId,
    );

    if (foundVariable) {
      if (
        foundVariable.dataType === 'date' &&
        isValid(new Date(foundVariable.value as string))
      ) {
        (foundVariable as any).valueLabel = new Date(
          foundVariable.value as string,
        ).toLocaleDateString();
      } else if (typeof foundVariable.value === 'boolean') {
        (foundVariable as any).valueLabel = foundVariable.value
          ? 'True'
          : 'False';
      } else {
        (foundVariable as any).valueLabel = foundVariable.value.toString();
      }
    }

    return foundVariable;
  }, [node.attrs.variableId, variables]);

  return (
    <Popover>
      {isLoadingVariables ? (
        <Popover.Trigger>
          <span
            className={cn('template-variable', {
              loading: true,
            })}
          >
            <span>Loading...</span>
          </span>
        </Popover.Trigger>
      ) : (
        <Popover.Trigger>
          <span
            className={cn('template-variable', {
              invalid: !variable && !isLoadingVariables,
            })}
          >
            <span>{variableName}</span>
          </span>
        </Popover.Trigger>
      )}
      <Popover.Content portal={false} className="p-4 min-w-96">
        {!variable ? (
          isLoadingVariables ? (
            <div>Loading...</div>
          ) : (
            <div>Variable not found</div>
          )
        ) : (
          <div className="space-y-2">
            <div className="space-x-2 flex items-center">
              <Icons.braces className="size-4" />
              <span className="font-semibold">{variable.name}</span>
            </div>
            <Separator />
            <div className="flex flex-col space-y-2">
              <div className="flex justify-between space-x-6">
                <span className="text-sm text-muted-foreground">Type</span>
                <span className="text-sm">{variable.type}</span>
              </div>
              <div className="flex justify-between space-x-6">
                <span className="text-sm text-muted-foreground">Data Type</span>
                <span className="text-sm">{variable.dataType}</span>
              </div>
              <div className="flex justify-between space-x-6">
                <span className="text-sm text-muted-foreground">Value</span>
                <span className="text-sm">{(variable as any).valueLabel}</span>
              </div>
              {variable.description && (
                <div className="flex justify-between space-x-6">
                  <span className="text-sm text-muted-foreground">
                    Description
                  </span>
                  <span className="text-sm line-clamp-3 text-end">
                    {variable.description}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </Popover.Content>
    </Popover>
  );
};

const ReferenceRefTypeContent = ({ node }: { node: NodeWithAttrs }) => {
  const { getNodes } = useReactFlow();
  const { variableName } = node.attrs;
  const { data: workflowApps, isLoading: isLoadingWorkflowApps } = useApiQuery({
    service: 'workflowApps',
    method: 'getList',
    apiLibraryArgs: {},
  });

  const { referenceNode, referenceApp } = useMemo(() => {
    const nodes = getNodes();

    if (!node.attrs.variableId) return {};

    const variableId = node.attrs.variableId?.split(',')[0];

    const foundReference = nodes.find((_node) => _node.id === variableId);
    const foundReferenceApp = workflowApps?.find(
      (app) => app.id === foundReference?.data.appId,
    );

    return {
      referenceNode: foundReference,
      referenceApp: foundReferenceApp,
    };
  }, [getNodes, node.attrs.variableId, workflowApps]);

  return (
    <Popover>
      {isLoadingWorkflowApps ? (
        <Popover.Trigger>
          <span
            className={cn('template-variable', {
              loading: true,
            })}
          >
            <span>Loading...</span>
          </span>
        </Popover.Trigger>
      ) : (
        <Popover.Trigger>
          <span
            className={cn('template-variable', {
              invalid: !referenceNode,
            })}
          >
            <span>
              {referenceApp && (
                <img
                  src={referenceApp?.logoUrl}
                  alt={referenceApp?.name}
                  className="size-4 bg-white p-0.5 rounded inline mr-1"
                  style={{ marginBottom: '2.5px' }}
                />
              )}
              {variableName}
            </span>
          </span>
        </Popover.Trigger>
      )}
      {!referenceNode ? (
        <Popover.Content portal={false} className="p-4 min-w-96">
          Reference not found
        </Popover.Content>
      ) : (
        <Popover.Content portal={false} className="p-4 min-w-96">
          <div className="space-y-2">
            <div className="space-x-2 flex items-center">
              {referenceApp && (
                <img
                  src={referenceApp.logoUrl}
                  alt={referenceApp.name}
                  className="size-5 bg-white p-0.5 rounded"
                />
              )}
              <span className="font-semibold">{referenceNode.data.name}</span>
            </div>
            <Separator />
            <div className="flex flex-col space-y-2">
              {referenceApp && (
                <div className="flex justify-between space-x-6">
                  <span className="text-sm text-muted-foreground">App</span>
                  <span className="text-sm">{referenceApp.name}</span>
                </div>
              )}
              {referenceNode.data.description && (
                <div className="flex justify-between space-x-6">
                  <span className="text-sm text-muted-foreground">
                    Description
                  </span>
                  <span className="text-sm line-clamp-3 text-end">
                    {referenceNode.data.description}
                  </span>
                </div>
              )}
            </div>
          </div>
        </Popover.Content>
      )}
    </Popover>
  );
};
