import { useNavigate, useParams } from 'react-router-dom';

import useApiQuery from '@/api/use-api-query';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { ComboBox } from '@/components/ui/combo-box';
import { timeAgo } from '@/utils/dates';

export function NavTaskSelector() {
  const { projectId, taskId, agentId } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useApiQuery({
    service: 'tasks',
    method: 'getList',
    apiLibraryArgs: {
      config: {
        params: {
          filterBy: [`agentId:${agentId}`],
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
      items={[
        {
          value: 'new',
          label: 'New Conversation',
        },
        ...(data?.map((task) => {
          return {
            value: task.id,
            label: `${task.name}`,
            subLabel: timeAgo(task.updatedAt),
          };
        }) ?? []),
      ]}
      defaultSelectedItem={{
        label:
          data?.find((task) => task.id === taskId)?.name ?? 'Untitled Task',
        value: taskId!,
      }}
      trigger={
        <Button variant="ghost" className="size-7 p-1">
          <Icons.caretSort className="size-10" />
        </Button>
      }
      searchLabel="Search conversations..."
      onChange={(value) => {
        if (value === 'new') {
          navigate(`/projects/${projectId}/agents/${agentId}`);
        } else {
          navigate(`/projects/${projectId}/agents/${agentId}/tasks/${value}`);
        }
      }}
    />
  );
}
