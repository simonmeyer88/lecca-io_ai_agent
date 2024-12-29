import { useMemo, useState } from 'react';

import { Icons } from '../../../../components/icons';
import { MarkdownViewer } from '../../../../components/markdown-viewer';
import { Avatar } from '../../../../components/ui/avatar';
import { Tooltip } from '../../../../components/ui/tooltip';
import { useUser } from '../../../../hooks/useUser';
import { Agent } from '../../../../models/agent/agent-model';
import { FormattedTaskUserMessage } from '../../../../models/task/formatted-task-message-model';
import { WorkflowApp } from '../../../../models/workflow/workflow-app-model';
import { Workflow } from '../../../../models/workflow/workflow-model';
import { WorkspaceUser } from '../../../../models/workspace-user-model';
import { cn } from '../../../../utils/cn';
import { toLocaleStringOrUndefined } from '../../../../utils/dates';

import { MessageCardWrapper } from './message-card-wrapper';
import { MessageImage } from './message-image';

export const MessageUserCard = ({
  user,
  content,
  createdAt,
  agent,
  mappedApps,
}: {
  user: {
    workspaceUser: WorkspaceUser | undefined;
    workflow: Workflow | undefined;
    agent: Agent | undefined;
  };
  agent: Agent;
  content: FormattedTaskUserMessage['content'];
  createdAt: Date | undefined;
  mappedApps: { [key: string]: WorkflowApp };
}) => {
  const {
    workspaceUser: workspaceUserAsMessageUser,
    workflow: workflowAsMessageUser,
    agent: agentAsMessageUser,
  } = user;
  const { workspaceUser: currentWorkspaceUser } = useUser();
  const [imageData, setImageData] = useState<string[]>([]);

  const isCurrentUser = useMemo(() => {
    return workspaceUserAsMessageUser?.id === currentWorkspaceUser?.id;
  }, [currentWorkspaceUser?.id, workspaceUserAsMessageUser?.id]);

  const fields = useMemo(() => {
    let name = '';
    let icon = null;
    let textContent = '';

    if (typeof content === 'string') {
      textContent = content;
    } else if (Array.isArray(content)) {
      textContent = content
        .map((c) => {
          if (c.type === 'text') {
            return c.text;
          } else if (c.type === 'image') {
            setImageData((prev) => [...prev, c.image]);
            return '';
          } else {
            return '';
          }
        })
        .join('');
    } else {
      new Error(
        'Message user card content must be a string or array: ' + content,
      );
    }

    if (workspaceUserAsMessageUser) {
      name = workspaceUserAsMessageUser.user?.name ?? 'Me';
      icon = (
        <Avatar className="size-6 border">
          <Avatar.Image
            src={workspaceUserAsMessageUser?.profileImageUrl ?? undefined}
            alt="User Profile Image"
          />
          <Avatar.Fallback>
            {workspaceUserAsMessageUser?.user?.name![0].toUpperCase()}
          </Avatar.Fallback>
        </Avatar>
      );
    } else if (agentAsMessageUser) {
      name = agentAsMessageUser.name;
      icon = agentAsMessageUser.profileImageUrl ? (
        <Avatar className="size-9 border mr-1">
          <Avatar.Image
            src={agentAsMessageUser.profileImageUrl ?? undefined}
            alt="Agent icon url"
          />
          <Avatar.Fallback className="text-lg">
            {agentAsMessageUser.name![0].toUpperCase()}
          </Avatar.Fallback>
        </Avatar>
      ) : (
        <div className="border rounded-md p-1.5 mr-1">
          <Icons.messageAgent className="size-5" />
        </div>
      );
    } else if (workflowAsMessageUser) {
      if (workflowAsMessageUser.isInternal) {
        const agentTriggers = agent.triggers;
        const trigger = agentTriggers?.find(
          (trigger) => trigger.FK_workflowId === workflowAsMessageUser.id,
        );

        if (!trigger) {
          name = 'Triggered';
          icon = (
            <div className="border rounded-md p-1.5 mr-1">
              <Icons.workflow className="size-5" />
            </div>
          );
        } else {
          const triggerApp = mappedApps[trigger.node.appId];
          const appTrigger = triggerApp?.triggers.find(
            (t) => t.id === trigger.node.triggerId,
          );

          textContent = createdAt
            ? `Triggered at ${toLocaleStringOrUndefined(createdAt)}`
            : 'Triggered Agent';
          name = trigger.node.name;
          icon = appTrigger ? (
            <div className="border rounded-md p-1.5 mr-1">
              <img
                src={appTrigger?.iconUrl ?? triggerApp?.logoUrl}
                alt={appTrigger?.name ?? triggerApp?.name}
                className={cn('size-5 rounded p-0.5', {
                  'dark:invert':
                    appTrigger?.id !== 'web_action_google-search' &&
                    appTrigger?.iconUrl != null,
                })}
              />
            </div>
          ) : (
            <div className="border rounded-md p-1.5 mr-1">
              <Icons.workflow className="size-5" />
            </div>
          );
        }
      } else {
        name = workflowAsMessageUser.name;
        icon = (
          <div className="border rounded-md p-1.5 mr-1">
            <Icons.workflow className="size-5" />
          </div>
        );
      }
    } else {
      name = 'Unknown';
      icon = (
        <div className="border rounded-md p-1.5 mr-1">
          <Icons.app className="size-5" />
        </div>
      );
    }

    return {
      name,
      icon,
      textContent,
    };
  }, [
    agent.triggers,
    agentAsMessageUser,
    content,
    createdAt,
    mappedApps,
    workflowAsMessageUser,
    workspaceUserAsMessageUser,
  ]);

  if (isCurrentUser) {
    return (
      <MessageCardWrapper
        text={fields.textContent}
        side={'right'}
        createdAt={createdAt}
        prefix={
          <Tooltip>
            <Tooltip.Trigger className="flex items-center">
              {fields.icon}
            </Tooltip.Trigger>
            <Tooltip.Content side="bottom">{fields.name}</Tooltip.Content>
          </Tooltip>
        }
      >
        <div
          className={cn('flex justify-end', {
            'flex-col items-end space-y-2': imageData.length,
          })}
        >
          {imageData.length ? <MessageImage imageData={imageData} /> : null}
          <div
            className={cn({
              'bg-muted px-5 py-0.5 rounded-3xl max-w-[350px] md:max-w-[500px] lg:max-w-[750px] overflow-x-auto':
                true,
            })}
          >
            <MarkdownViewer>{fields.textContent}</MarkdownViewer>
          </div>
        </div>
      </MessageCardWrapper>
    );
  } else {
    return (
      <MessageCardWrapper text={fields.textContent} createdAt={createdAt}>
        <div className="">
          <div className="flex items-center space-x-2">
            {fields.icon}
            <div className="flex items-center space-x-1.5 text-sm">
              <span className="font-medium">{fields.name}</span>
            </div>
          </div>
        </div>
        <div className="ml-12">
          {imageData?.length ? <MessageImage imageData={imageData} /> : null}
          <MarkdownViewer>{fields.textContent}</MarkdownViewer>
        </div>
      </MessageCardWrapper>
    );
  }
};
