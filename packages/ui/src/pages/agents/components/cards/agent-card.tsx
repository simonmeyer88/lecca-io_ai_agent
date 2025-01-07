import { useMemo } from 'react';
import { Link } from 'react-router-dom';

import { Avatar } from '../../../../components/ui/avatar';
import { Button } from '../../../../components/ui/button';
import { Card } from '../../../../components/ui/card';
import { Popover } from '../../../../components/ui/popover';
import { Agent } from '../../../../models/agent/agent-model';
import { WorkflowApp } from '../../../../models/workflow/workflow-app-model';
import { cn } from '../../../../utils/cn';

export const AgentCard = ({
  agent,
  mappedApps,
}: {
  agent: Agent;
  mappedApps: Record<string, WorkflowApp>;
}) => {
  const triggersAndActions = useMemo(() => {
    if (!agent) {
      return [];
    }

    const triggersWithAppInfo =
      agent.triggerIds?.map((triggerId) => {
        const appId = triggerId.split('_trigger_')[0];

        return {
          app: mappedApps[appId],
          actionOrTrigger: mappedApps[appId]?.triggers.find(
            (trigger) => trigger.id === triggerId,
          ),
        };
      }) ?? [];

    const toolsWithAppInfo =
      agent.toolIds?.map((toolId) => {
        const appId = toolId.split('_action_')[0];
        const actionId = toolId;

        return {
          app: mappedApps[appId],
          actionOrTrigger: mappedApps[appId]?.actions.find(
            (action) => action.id === actionId,
          ),
        };
      }) ?? [];

    return [...triggersWithAppInfo, ...toolsWithAppInfo];
  }, [agent, mappedApps]);

  return (
    <Card className={cn('pt-0 flex flex-col justify-between')}>
      <Card.Header className="relative">
        <Card.Title className="flex items-center space-x-2">
          <Avatar className="size-8 border group-hover:border-primary">
            <Avatar.Image
              src={agent.profileImageUrl ?? undefined}
              alt={`${agent.name} profile image`}
            />
            <Avatar.Fallback className="text-lg text-muted-foreground group-hover:text-primary">
              {agent.name![0].toUpperCase()}
            </Avatar.Fallback>
          </Avatar>
          <span>{agent.name}</span>
        </Card.Title>
        <Card.Description className="line-clamp-3">
          {agent.description}
        </Card.Description>
      </Card.Header>
      <Card.Footer className="w-full justify-between">
        {triggersAndActions && (
          <Avatar.Group limit={3} className="items-center mr-4">
            <Avatar.GroupList>
              {triggersAndActions!.map(({ actionOrTrigger, app }, index) => {
                return (
                  <Avatar
                    key={actionOrTrigger!.id + index}
                    className={cn(
                      'flex items-center justify-center border rounded-full bg-background cursor-pointer',
                    )}
                  >
                    <Avatar.Image
                      src={
                        actionOrTrigger!.iconUrl ?? app?.logoUrl ?? undefined
                      }
                      className="rounded-none object-contain size-5"
                    />
                  </Avatar>
                );
              })}
            </Avatar.GroupList>
            <Popover>
              <Popover.Trigger asChild>
                <Avatar.OverflowIndicator className="border cursor-pointer object-contain size-9" />
              </Popover.Trigger>
              <Popover.Content>
                <div className="p-4 text-sm">
                  <p>
                    {triggersAndActions
                      .slice(3)!
                      .map(({ actionOrTrigger }) => actionOrTrigger!.name)
                      .join(', ')}
                  </p>
                </div>
              </Popover.Content>
            </Popover>
          </Avatar.Group>
        )}
        <Button asChild size="sm">
          <Link to={`/agents/${agent.id}`}>
            <span>Chat</span>
          </Link>
        </Button>
      </Card.Footer>
    </Card>
  );
};
