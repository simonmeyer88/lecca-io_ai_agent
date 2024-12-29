import { useNavigate, useParams } from 'react-router-dom';

import useApiQuery from '../../../../api/use-api-query';
import { Icons } from '../../../../components/icons';
import { Avatar } from '../../../../components/ui/avatar';
import { Button } from '../../../../components/ui/button';
import { ComboBox } from '../../../../components/ui/combo-box';

type Props = {
  filterByProjectId?: boolean;
};

export function NavAgentSelector(props: Props) {
  const { projectId, agentId } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useApiQuery({
    service: 'agents',
    method: 'getList',
    apiLibraryArgs: props.filterByProjectId
      ? {
          config: {
            params: {
              filterBy: [`projectId:${projectId}`],
            },
          },
        }
      : {},
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
        prefix: (
          <Avatar className="size-6 border">
            <Avatar.Image
              src={agent?.profileImageUrl ?? undefined}
              alt="User Profile Image"
            />
            <Avatar.Fallback>{agent?.name![0].toUpperCase()}</Avatar.Fallback>
          </Avatar>
        ),
        value: agent.id,
        label: agent.name,
        subLabel: agent.project?.name,
      }))}
      defaultSelectedItem={{
        logoUrl: data?.find((agent) => agent.id === agentId)?.profileImageUrl,
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
