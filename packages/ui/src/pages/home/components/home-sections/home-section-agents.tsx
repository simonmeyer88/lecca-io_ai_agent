import { Link } from 'react-router-dom';

import useApiQuery from '../../../../api/use-api-query';
import { SelectProjectForAgentForm } from '../../../../components/forms/select-project-for-agent-form';
import { Icons } from '../../../../components/icons';
import { TableLoader } from '../../../../components/loaders/table-loader';
import { Avatar } from '../../../../components/ui/avatar';
import { Dialog } from '../../../../components/ui/dialog';

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
        <Icons.agent className="size-6" />
        <span>Agents</span>
      </h2>
      <div className="flex overflow-x-auto space-x-4">
        {agents.map((agent) => (
          <Link
            to={`/agents/${agent.id}`}
            className="relative rounded-full hover:brightness-125"
          >
            <Avatar className="size-16 border">
              <Avatar.Image
                src={agent.iconUrl ?? undefined}
                alt="Agent icon url"
              />
              <Avatar.Fallback className="text-lg">
                {agent.name![0].toUpperCase()}
              </Avatar.Fallback>
            </Avatar>
          </Link>
        ))}
        <Dialog>
          <Dialog.Trigger className="cursor-pointer">
            <Avatar className="size-16 border opacity-75 hover:opacity-100">
              <Avatar.Fallback className="text-lg">
                <Icons.plus className="size-8 text-muted-foreground" />
              </Avatar.Fallback>
            </Avatar>
          </Dialog.Trigger>
          <Dialog.Content>
            <SelectProjectForAgentForm />
          </Dialog.Content>
        </Dialog>
      </div>
    </div>
  );
}
