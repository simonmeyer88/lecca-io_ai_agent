import { v4 } from 'uuid';

import { FormattedTaskMessage } from '@/models/task/formatted-task-message-model';
import { SavedTaskMessage } from '@/models/task/saved-task-message-model';
import { StreamedTaskAssistantMessageToolInvocation } from '@/models/task/streamed-task-message-model';

export function formatSavedMessagesToStreamedMessageFormat({
  messages,
  currentAgentId,
}: {
  messages: SavedTaskMessage[];
  currentAgentId: string;
}): FormattedTaskMessage[] {
  const formattedMessage: FormattedTaskMessage[] = [];

  let toolInvocationMap: Record<
    string,
    Partial<StreamedTaskAssistantMessageToolInvocation> & {
      data:
        | {
            appId?: string;
            actionId?: string;
          }
        | undefined;
    }
  > = {};
  let currentAssistantId: string;

  messages.forEach((message) => {
    if (message.role === 'user') {
      formattedMessage.push(message);
    } else if (message.role === 'assistant') {
      //Set the current assistant id
      currentAssistantId = message.data?.agentId ?? currentAgentId;

      message.content.forEach((content) => {
        currentAssistantId = message.data?.agentId ?? currentAgentId;
        if (content.type === 'text') {
          if (content.text === '') {
            //Do nothing
          } else {
            /**
             * When we get here, the assistant is providing an update,
             * If it has used any tools, we'll want to add a message for that.
             */

            // 1. Check if there are tools for this assistant.
            if (Object.keys(toolInvocationMap).length) {
              // 1.a. Create a new assistant message with the tool invocations
              Object.values(toolInvocationMap).forEach((tools) => {
                const messageWithToolInvocations: FormattedTaskMessage = {
                  id: v4(),
                  role: 'assistant',
                  content: '',
                  data: {
                    ...message.data,
                    agentId: currentAssistantId,
                  },
                  toolInvocations: [
                    {
                      state: tools.state!,
                      toolCallId: tools.toolCallId!,
                      toolName: tools.toolName!,
                      args: tools.args!,
                      result: tools.result!,
                      data: tools.data,
                    },
                  ],
                };

                // 1.b. Push the assistant message with the tool invocations
                formattedMessage.push(messageWithToolInvocations);
              });

              // 1.c. Clear the tool invocation map
              toolInvocationMap = {};
            }

            // 2. Push the assistant response
            formattedMessage.push({
              ...message,
              content: content.text,
            });
          }
        } else if (content.type === 'tool-call') {
          toolInvocationMap[content.toolCallId] = {
            state: 'result',
            toolCallId: content.toolCallId,
            toolName: content.toolName,
            args: content.args,
            data: undefined, //will be set in message.role === 'tool' & content.type === 'tool-result'
          };
        } else {
          throw new Error(
             
            'Unknown assistant message type: ' + (content as any).type,
          );
        }
      });
    } else if (message.role === 'tool') {
      message.content.forEach((content) => {
        if (content.type === 'tool-result') {
          if (toolInvocationMap[content.toolCallId]) {
            toolInvocationMap[content.toolCallId] = {
              ...toolInvocationMap[content.toolCallId],
              result: content.result,
              data: {
                actionId: content.data?.actionId,
                appId: content.data?.appId,
              },
            };
          } else {
            throw new Error(
              'Tool result without tool invocation: ' + content.toolCallId,
            );
          }
        } else {
          throw new Error('Unknown tool message type: ' + content.type);
        }
      });
    }
  });

  return formattedMessage;
}
