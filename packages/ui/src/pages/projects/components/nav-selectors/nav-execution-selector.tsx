import { useNavigate, useParams } from 'react-router-dom';

import useApiQuery from '../../../../api/use-api-query';
import { Icons } from '../../../../components/icons';
import { Button } from '../../../../components/ui/button';
import { ComboBox } from '../../../../components/ui/combo-box';
import { timeAgo } from '../../../../utils/dates';

export function NavExecutionSelector() {
  const { projectId, executionId } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useApiQuery({
    service: 'executions',
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
      items={data?.map((execution) => ({
        value: execution.id,
        label: `#${execution.executionNumber}`,
        subLabel: timeAgo(execution.startedAt!),
      }))}
      defaultSelectedItem={{
        label:
          data
            ?.find((execution) => execution.id === executionId)
            ?.executionNumber.toString() ?? 'Unknown execution',
        value: executionId!,
      }}
      trigger={
        <Button variant="ghost" className="size-7 p-1">
          <Icons.caretSort className="size-10" />
        </Button>
      }
      searchLabel="Search executions..."
      onChange={(value) =>
        navigate(`/projects/${projectId}/executions/${value}`)
      }
    />
  );
}
