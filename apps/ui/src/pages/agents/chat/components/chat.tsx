 
import { Message, useChat } from 'ai/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRef } from 'react';
import { v4 } from 'uuid';

import { api } from '@/api/api-library';
import useApiQuery from '@/api/use-api-query';
import { Loader } from '@/components/loaders/loader';
import { useUser } from '@/hooks/useUser';
import { Agent } from '@/models/agent/agent-model';
import { AiProvider } from '@/models/ai-provider-model';
import { FormattedTaskMessage } from '@/models/task/formatted-task-message-model';
import { WorkflowApp } from '@/models/workflow/workflow-app-model';

import { formatSavedMessagesToStreamedMessageFormat } from '../utils/format-saved-messages-to-streamed-message-format';
import { MessageMeta } from '../utils/message-meta';

import { AgentConfigureToolbar } from './agent-configure-toolbar';
import { ChatInput } from './chat-input';
import { MessageAgentCard } from './message-agent-card';
import { MessageCard } from './message-card';
import { NewChatWelcome } from './new-chat-welcome';

type Props = {
  taskId?: string;
  projectId: string;
  agent: Agent;
  defaultMessages?: FormattedTaskMessage[];
};

export function Chat(props: Props) {
  const { aiProviders } = useUser();
  const [imageData, setImageData] = useState<string[]>([]);
  const [isLoadingResponse, setIsLoadingResponse] = useState(false);
  const activeTaskId = useMemo(() => props.taskId ?? v4(), [props.taskId]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, setRerender] = useState(0);

  //Used to hold state and manage rendering for some parts of the chat
  const messageMeta = useRef<MessageMeta>(new MessageMeta(setRerender));

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  //The 30 is the offset, the 64 is from the bottom padding we have (pb-16)
  const scrollOffset = 30 + 64 + 60;

  const scrollToBottom = useCallback(
    (args?: { force?: boolean }) => {
      const container = messagesEndRef.current;
      if (container) {
        const { scrollTop, clientHeight, scrollHeight } = container;
        if (
          args?.force ||
          scrollTop + clientHeight >= scrollHeight - scrollOffset
        ) {
          setTimeout(() => {
            container.scrollTo({
              top: container.scrollHeight + 200,
              behavior: 'smooth',
            });
          }, 0);
        }
      }
    },
    [scrollOffset],
  );

  const canStream = useMemo(() => {
    const llmModel =
      aiProviders[props.agent.llmProvider as AiProvider]?.languageModels?.[
        props.agent.llmModel ?? ''
      ];

    if (llmModel?.canStreamText && llmModel.canStreamTools) {
      return true;
    } else if (llmModel?.canStreamText && !llmModel?.canStreamTools) {
      if (
        props.agent.agentKnowledge?.length ||
        props.agent.agentActions?.length ||
        props.agent.agentWorkflows?.length ||
        props.agent.agentPhoneAccess?.outboundCallsEnabled ||
        props.agent.agentSubAgents?.length ||
        props.agent.agentWebAccess?.webSearchEnabled ||
        props.agent.agentWebAccess?.websiteAccessEnabled ||
        props.agent.agentVariables?.length
      ) {
        return false;
      } else {
        //If they can't stream tools, but they don't have any, then they can stream.
        return true;
      }
    } else {
      return false;
    }
  }, [
    aiProviders,
    props.agent.agentActions?.length,
    props.agent.agentKnowledge?.length,
    props.agent.agentPhoneAccess,
    props.agent.agentSubAgents?.length,
    props.agent.agentVariables?.length,
    props.agent.agentWebAccess,
    props.agent.agentWorkflows?.length,
    props.agent.llmModel,
    props.agent.llmProvider,
  ]);

  const hasToolsButCannotUseThem = useMemo(() => {
    const llmModel =
      aiProviders[props.agent.llmProvider as AiProvider]?.languageModels?.[
        props.agent.llmModel ?? ''
      ];

    if (!llmModel?.tools) {
      if (
        props.agent.agentKnowledge?.length ||
        props.agent.agentActions?.length ||
        props.agent.agentWorkflows?.length ||
        props.agent.agentPhoneAccess?.outboundCallsEnabled ||
        props.agent.agentSubAgents?.length ||
        props.agent.agentWebAccess?.webSearchEnabled ||
        props.agent.agentWebAccess?.websiteAccessEnabled ||
        props.agent.agentVariables?.length
      ) {
        return true;
      }
    }

    return false;
  }, [
    aiProviders,
    props.agent.agentActions?.length,
    props.agent.agentKnowledge?.length,
    props.agent.agentPhoneAccess?.outboundCallsEnabled,
    props.agent.agentSubAgents?.length,
    props.agent.agentVariables?.length,
    props.agent.agentWebAccess?.webSearchEnabled,
    props.agent.agentWebAccess?.websiteAccessEnabled,
    props.agent.agentWorkflows?.length,
    props.agent.llmModel,
    props.agent.llmProvider,
  ]);

  const { data: agents } = useApiQuery({
    service: 'agents',
    method: 'getList',
    apiLibraryArgs: {
      config: {
        params: {
          filterBy: [`projectId:${props.projectId}`],
        },
      },
    },
  });

  const { data: workspaceUsers } = useApiQuery({
    service: 'workspaceUsers',
    method: 'getList',
    apiLibraryArgs: {},
  });

  const { data: knowledge } = useApiQuery({
    service: 'knowledge',
    method: 'getList',
    apiLibraryArgs: {
      config: {
        params: {
          filterBy: [`projectAccessId:${props.projectId}`],
        },
      },
    },
  });

  const { data: apps } = useApiQuery({
    service: 'workflowApps',
    method: 'getList',
    apiLibraryArgs: {},
  });

  const { data: workflows } = useApiQuery({
    service: 'workflows',
    method: 'getList',
    apiLibraryArgs: {
      config: {
        params: {
          filterBy: [`projectId:${props.projectId}`],
        },
      },
    },
  });

  const mappedApps = useMemo(() => {
    if (!apps) {
      return {};
    }

    return apps.reduce(
      (acc, app) => {
        acc[app.id] = app;
        return acc;
      },
      {} as { [key: string]: WorkflowApp },
    );
  }, [apps]);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit: handleSubmitStreamMessage,
    setInput,
    error,
    setMessages,
    stop,
    reload,
  } = useChat({
    onError: (error) => {
      let message = '';
      try {
        message = JSON.parse(error.message).message;
      } catch {
        message = error.message;
      }

      setMessages([
        ...messages,
        {
          id: v4(),
          role: 'system',
          content: message,
        },
      ]);
    },
    api: `${import.meta.env.VITE_SERVER_URL}/agents/${props.agent.id}/tasks/${props.taskId ?? activeTaskId}/stream-message`,
    keepLastMessageOnError: true,
    experimental_prepareRequestBody: ({ messages }) => {
      const preparedMessages = prepareMessagesToSend({ messages });
      return { messages: preparedMessages } as any;
    },
    headers: {
      Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
    },
    onFinish: () => {
      if (!props.taskId) {
        //This is a new task, so we need to update the URL
        window.history.pushState(
          {},
          '',
          `/projects/${props.projectId}/agents/${props.agent.id}/tasks/${activeTaskId}`,
        );
      }
    },
  });

  const prepareMessagesToSend = useCallback(
    ({ messages }: { messages: Message[] }) => {
      const previousMessages = messages.slice(0, messages.length - 1);
      const newMessage = messages[messages.length - 1];

      if (imageData.length) {
        const newMessageWithImage = {
          ...newMessage,
          content: [
            {
              type: 'text',
              text: newMessage.content,
            },
            ...imageData.map((image) => ({
              type: 'image',
              image: new URL(image),
            })),
          ],
        };

        //clear image data state
        setImageData([]);
        setMessages([...previousMessages, newMessageWithImage] as any);

        return [newMessageWithImage] as unknown as Message[];
      } else {
        setMessages(messages as any);
        return [newMessage] as unknown as Message[];
      }
    },
    [imageData, setMessages],
  );

  const handleSendMessage = useCallback(async () => {
    if (canStream) {
      handleSubmitStreamMessage();
      return;
    } else {
      setIsLoadingResponse(true);
      const userMessage = {
        id: v4(),
        role: 'user',
        content: input,
        createdAt: new Date(),
      };

      const tempMessages = [...messages, userMessage];
      setInput('');
      const preparedMessages = prepareMessagesToSend({
        messages: tempMessages as Message[],
      });

      const response = await api.tasks.sendMessage({
        agentId: props.agent.id,
        taskId: props.taskId ?? activeTaskId,
        messages: preparedMessages as FormattedTaskMessage[],
      });

      setIsLoadingResponse(false);

      if (response.error) {
        setMessages([
          ...tempMessages,
          {
            id: v4(),
            role: 'system',
            content: response.error,
          },
        ] as any);
      } else {
        const responseMessages = response.data ?? [];
        const formatToStreamFormat = formatSavedMessagesToStreamedMessageFormat(
          {
            messages: responseMessages,
            currentAgentId: props.agent.id,
          },
        );

        setMessages([...tempMessages, ...formatToStreamFormat] as any);

        if (!props.taskId) {
          //This is a new task, so we need to update the URL
          window.history.pushState(
            {},
            '',
            `/projects/${props.projectId}/agents/${props.agent.id}/tasks/${activeTaskId}`,
          );
        }
      }
    }
  }, [
    activeTaskId,
    canStream,
    handleSubmitStreamMessage,
    input,
    messages,
    prepareMessagesToSend,
    props.agent.id,
    props.projectId,
    props.taskId,
    setInput,
    setMessages,
  ]);

  useEffect(() => {
    if (error as any) {
      try {
        const parsedError = JSON.parse((error as any).message);
        if (parsedError.statusCode === 401) {
          api.auth.refreshToken().then(() => {
            reload();
          });
        }
      } catch {
        //Error will be displayed in chat ui as system message
      }
    }
  }, [error, reload]);

  useEffect(() => {
    if (props.defaultMessages) {
      setMessages(props.defaultMessages as Message[]);
    }
    //Only run initially
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.defaultMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  if (!agents || !workspaceUsers || !knowledge || !apps || !workflows) {
    return <Loader />;
  }

  return (
    <div className="flex flex-col justify-between w-full min-h-full h-[calc(100dvh-90px)]">
      <div
        ref={messagesEndRef}
        className="overflow-y-auto flex flex-col h-full w-full overflow-x-hidden"
      >
        <div className="relative flex flex-col h-full w-full max-w-[1000px] mx-auto space-y-6 pb-16 sm:pb-20">
          {!messages.length ? (
            <div className="mt-10 space-y-4 pb-20 px-3 sm:px-0">
              <NewChatWelcome agent={props.agent} />
              <div className="space-y-4 sm:px-10 mx-auto w-full">
                <ChatInput
                  hasToolsButCannotUseThem={hasToolsButCannotUseThem}
                  isLoading={isLoadingResponse}
                  handleInputChange={handleInputChange}
                  handleSubmit={() => {
                    scrollToBottom({ force: true });
                    handleSendMessage();
                  }}
                  input={input}
                  setInput={setInput}
                  setImageData={setImageData}
                  imageData={imageData}
                  stop={stop}
                />
                <AgentConfigureToolbar
                  agentId={props.agent.id!}
                  projectId={props.projectId!}
                  selectorContentSide="right"
                  mode="welcome"
                />
              </div>
            </div>
          ) : (
            <div className="py-16 space-y-4 ">
              {messages?.map((m, index) => (
                <MessageCard
                  key={m.id}
                  message={m as FormattedTaskMessage}
                  agent={props.agent}
                  agents={agents}
                  workspaceUsers={workspaceUsers}
                  knowledge={knowledge}
                  mappedApps={mappedApps}
                  messageIndex={index}
                  messageMeta={messageMeta.current}
                  workflows={workflows}
                />
              ))}
              {isLoadingResponse && (
                <MessageAgentCard
                  agent={props.agent}
                  createdAt={new Date()}
                  status="loading"
                  textContent=""
                />
              )}
            </div>
          )}
        </div>
      </div>
      {messages.length > 0 && (
        <div className="space-y-4 max-w-[1050px] pb-10 sm:pb-0 sm:px-10 mx-auto w-full">
          <ChatInput
            hasToolsButCannotUseThem={hasToolsButCannotUseThem}
            isLoading={isLoadingResponse}
            handleInputChange={handleInputChange}
            handleSubmit={() => {
              scrollToBottom({ force: true });
              handleSendMessage();
            }}
            input={input}
            setInput={setInput}
            setImageData={setImageData}
            imageData={imageData}
            stop={stop}
          />
          <AgentConfigureToolbar
            agentId={props.agent.id!}
            projectId={props.projectId!}
            selectorContentSide="top"
            mode="chat"
          />
        </div>
      )}
    </div>
  );
}
