import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';

import useApiMutation from '@/api/use-api-mutation';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Agent,
  UpdateAgentType,
  createAgentSchema,
} from '@/models/agent/agent-model';
import { debounce } from '@/utils/debounce';

type NewChatWelcomeProps = {
  agent: Agent;
};

export function NewChatWelcome({ agent }: NewChatWelcomeProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const nameTextSpanRef = useRef<HTMLSpanElement | null>(null);
  const [nameInputWidth, setNameInputWidth] = useState('auto');

  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const descriptionTextSpanRef = useRef<HTMLSpanElement | null>(null);
  const [descriptionInputWidth, setDescriptionInputWidth] = useState('auto');

  // const [isEditingInstructions, setIsEditingInstructions] = useState(false);

  const saveAgentMutation = useApiMutation({
    service: 'agents',
    method: 'update',
  });

  const form = useForm<UpdateAgentType>({
    resolver: zodResolver(createAgentSchema),
    defaultValues: {
      name: agent.name,
      description: agent.description,
      instructions: agent.instructions,
      connectionIds: agent.connections?.map((c) => c.id) ?? [], //Legacy
      knowledgeIds: agent.agentKnowledge?.map((k) => k.id) ?? [], //Legacy
      actionIds: agent.agentActions?.map((a) => a.id) ?? [], //Legacy
      workflowIds: agent.agentWorkflows?.map((w) => w.id) ?? [], //Legacy
      agentIds: agent.agentSubAgents?.map((a) => a.id) ?? [], //Legacy
      variableIds: agent.agentVariables?.map((v) => v.id) ?? [], //Legacy
      webAccess:
        agent.agentWebAccess?.webSearchEnabled ||
        agent.agentWebAccess?.websiteAccessEnabled ||
        false, //Legacy
      phoneAccess:
        agent.agentPhoneAccess?.inboundCallsEnabled ||
        agent.agentPhoneAccess?.outboundCallsEnabled ||
        false, //Legacy
      llmProvider: agent.llmProvider,
      llmModel: agent.llmModel,
      llmConnectionId: agent.llmConnection?.id,
      maxToolRoundtrips: agent.maxToolRoundtrips,
      frequencyPenalty: agent.frequencyPenalty,
      presencePenalty: agent.presencePenalty,
      temperature: agent.temperature,
      maxTokens: agent.maxTokens,
      messageLookbackLimit: agent.messageLookbackLimit,
      maxRetries: agent.maxRetries,
      seed: agent.seed,
      tools: agent.tools,
      topP: agent.topP,
    },
  });

  useEffect(() => {
    if (nameTextSpanRef.current && !isEditingName) {
      const newInputWidth = nameTextSpanRef.current.offsetWidth + 30;
      setNameInputWidth((newInputWidth > 200 ? newInputWidth : 200) + 'px');
    }
  }, [isEditingName]);

  useEffect(() => {
    if (descriptionTextSpanRef.current && !isEditingDescription) {
      const newInputWidth = descriptionTextSpanRef.current.offsetWidth + 30;
      setDescriptionInputWidth(
        (newInputWidth > 200 ? newInputWidth : 200) + 'px',
      );
    }
  }, [isEditingDescription, isEditingName]);

  useEffect(() => {
    const handleSave = debounce((values) => {
      saveAgentMutation.mutate({
        id: agent.id,
        data: {
          name: values.name,
          description: values.description,
          instructions: values.instructions,
        },
      });
    }, 500);

    const subscription = form.watch(handleSave);

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [agent.id, form, saveAgentMutation]);

  return (
    <Form {...form}>
      <form
        className="w-full mt-[calc(15dvh)]"
        onSubmit={(e) => e.preventDefault()}
      >
        <Form.Content className="space-y-1 p-0 sm:px-10 flex flex-col justify-center items-center -mr-8">
          <Form.Field
            control={form.control}
            name="name"
            render={({ field }) =>
              isEditingName ? (
                <Form.Item className="flex items-center space-x-2 p-0.5">
                  <Input
                    {...field}
                    autoFocus
                    onBlur={() => setIsEditingName(false)}
                    onKeyUp={(e) => {
                      if (e.key === 'Enter') {
                        setIsEditingName(false);
                      }
                    }}
                    className="text-4xl font-semibold"
                    style={{ width: nameInputWidth }}
                  />
                  <Button
                    onClick={() => setIsEditingName(false)}
                    className="size-6 p-1"
                    type="button"
                    variant="ghost"
                  >
                    <Icons.check />
                  </Button>
                </Form.Item>
              ) : (
                <div
                  className="flex items-center space-x-2 group"
                  onClick={() => {
                    setIsEditingName(true);
                  }}
                >
                  {field.value ? (
                    <span
                      className="text-4xl font-semibold text-center"
                      ref={nameTextSpanRef}
                    >
                      {field.value}
                    </span>
                  ) : (
                    <span
                      className="text-3xl font-normal text-muted-foreground animate-pulse"
                      ref={nameTextSpanRef}
                    >
                      Add Name
                    </span>
                  )}
                  <Button
                    onClick={() => setIsEditingName(true)}
                    className="size-6 p-1 invisible group-hover:visible"
                    type="button"
                    variant="ghost"
                  >
                    <Icons.pencil />
                  </Button>
                </div>
              )
            }
          />
          <Form.Field
            control={form.control}
            name="description"
            render={({ field }) =>
              isEditingDescription ? (
                <Form.Item className="flex items-center space-x-2">
                  <Input
                    {...field}
                    autoFocus
                    onBlur={() => setIsEditingDescription(false)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setIsEditingDescription(false);
                      }
                    }}
                    className="text-sm font-medium text-muted-foreground"
                    style={{ width: descriptionInputWidth }}
                  />
                  <Button
                    onClick={() => setIsEditingDescription(false)}
                    className="size-6 p-1"
                    type="button"
                    variant="ghost"
                  >
                    <Icons.check />
                  </Button>
                </Form.Item>
              ) : (
                <div
                  className="flex items-center space-x-2 group p-1.5"
                  onClick={() => {
                    setIsEditingDescription(true);
                  }}
                >
                  {field.value ? (
                    <span
                      className="text-sm font-medium text-muted-foreground text-center"
                      ref={descriptionTextSpanRef}
                    >
                      {field.value}
                    </span>
                  ) : (
                    <span
                      className="text-xs font-normal text-muted-foreground animate-pulse"
                      ref={descriptionTextSpanRef}
                    >
                      Add agent description
                    </span>
                  )}
                  <Button
                    onClick={() => setIsEditingDescription(true)}
                    className="size-6 p-1 invisible group-hover:visible"
                    type="button"
                    variant="ghost"
                  >
                    <Icons.pencil />
                  </Button>
                </div>
              )
            }
          />
        </Form.Content>
      </form>
    </Form>
  );
}
