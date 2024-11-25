import { useNavigate, useParams } from 'react-router-dom';

import useApiQuery from '@/api/use-api-query';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { ComboBox } from '@/components/ui/combo-box';

export function NavWorkflowSelector() {
  const { projectId, workflowId } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useApiQuery({
    service: 'workflows',
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
      items={data?.map((workflow) => ({
        value: workflow.id,
        label: workflow.name,
      }))}
      defaultSelectedItem={{
        label:
          data?.find((workflows) => workflows.id === workflowId)?.name ??
          'Untitled Workflow',
        value: workflowId!,
      }}
      trigger={
        <Button variant="ghost" className="size-7 p-1">
          <Icons.caretSort className="size-10" />
        </Button>
      }
      searchLabel="Search workflows..."
      onChange={(value) =>
        navigate(`/redirect?redirect=/projects/${projectId}/workflows/${value}`)
      }
    />
  );
}
