import { useNavigate, useParams } from 'react-router-dom';

import useApiQuery from '@/api/use-api-query';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { ComboBox } from '@/components/ui/combo-box';

export function NavAgentSelector() {
  const { projectId, agentId } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useApiQuery({
    service: 'agents',
    method: 'getList',
    apiLibraryArgs: {
      config: {
        params: {
          filterBy: [`projectId:${projectId}`],
        },
      },
    },
  });

  if (!projectId) {
    return null;
  }

  if (isLoading) {
    return <Icons.spinner className="animate-spin" />;
  }

  return (
    <ComboBox
      items={data?.map((agent) => ({
        value: agent.id,
        label: agent.name,
      }))}
      defaultSelectedItem={{
        label:
          data?.find((agent) => agent.id === agentId)?.name ?? 'Untitled Agent',
        value: agentId!,
      }}
      trigger={
        <Button variant="ghost" className="size-7 p-1">
          <Icons.caretSort className="size-10" />
        </Button>
      }
      searchLabel="Search agents..."
      onChange={(value) => navigate(`/projects/${projectId}/agents/${value}`)}
    />
  );
}
