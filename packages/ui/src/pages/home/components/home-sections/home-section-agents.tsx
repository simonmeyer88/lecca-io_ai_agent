import { Link } from 'react-router-dom';

import useApiQuery from '../../../../api/use-api-query';
import { SelectProjectForAgentForm } from '../../../../components/forms/select-project-for-agent-form';
import { Icons } from '../../../../components/icons';
import { TableLoader } from '../../../../components/loaders/table-loader';
import { Avatar } from '../../../../components/ui/avatar';
import { Dialog } from '../../../../components/ui/dialog';
import { Tooltip } from '../../../../components/ui/tooltip';

export function HomeSectionAgents() {
  const { data: agents, isLoading: isLoadingAgents } = useApiQuery({
    service: 'agents',
    method: 'getList',
    apiLibraryArgs: {},
    reactQueryArgs: {
      queries: {
        staleTime: 1000 * 60 * 0, //0 minutes - immediately refetch when component is loaded.
      },
    },
  });

  if (isLoadingAgents) {
    return (
      <div className="w-full">
        <TableLoader exactLength={5} />
      </div>
    );
  }

  if (!agents?.length) {
    return null;
  }

  return (
    <div className="w-full flex flex-col space-y-6">
      <h2 className="text-2xl font-bold space-x-2 flex items-center">
        <span>Agents</span>
      </h2>
      <div className="flex space-x-4 overflow-x-auto py-2">
        {agents.map((agent) => (
          <div key={agent.id}>
            <Link
              to={`/agents/${agent.id}`}
              className="flex flex-col items-center rounded-full cursor-pointer group"
            >
              <Avatar className="size-16 border group-hover:border-primary">
                <Avatar.Image
                  src={agent.profileImageUrl ?? undefined}
                  alt="Agent icon url"
                />
                <Avatar.Fallback className="text-lg text-muted-foreground group-hover:text-primary">
                  {agent.name![0].toUpperCase()}
                </Avatar.Fallback>
              </Avatar>
            </Link>
            <p className="text-xs mt-2 text-muted-foreground text-center">
              {agent.name!.length > 10 ? (
                <Tooltip>
                  <Tooltip.Trigger className="line-clamp-1">{`${agent.name!.substring(0, 10)}...`}</Tooltip.Trigger>
                  <Tooltip.Content className="line-clamp-1" side="bottom">
                    {agent.name}
                  </Tooltip.Content>
                </Tooltip>
              ) : (
                agent.name
              )}
            </p>
          </div>
        ))}
        <Dialog>
          <Dialog.Trigger className="cursor-pointer">
            <Avatar className="size-16 border opacity-75 hover:opacity-100">
              <Avatar.Fallback className="text-lg">
                <Icons.plus className="size-8 text-muted-foreground" />
              </Avatar.Fallback>
            </Avatar>
            <div className="h-6"></div>
          </Dialog.Trigger>
          <Dialog.Content>
            <SelectProjectForAgentForm />
          </Dialog.Content>
        </Dialog>
      </div>
    </div>
  );
}
