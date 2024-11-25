import useApiQuery from '@/api/use-api-query';
import { JsonViewer } from '@/components/json-viewer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
import { toLocaleStringOrUndefined } from '@/utils/dates';

export function CreditDetailsDialogContent({ creditId }: { creditId: string }) {
  const { data, isLoading } = useApiQuery({
    service: 'credits',
    method: 'getById',
    apiLibraryArgs: {
      id: creditId,
    },
  });

  if (isLoading || !data) {
    return null;
  }

  return (
    <Card className="border-none bg-background">
      <Card.Header>
        <Card.Title className="text-xl font-medium">
          Credit Usage Details
        </Card.Title>
      </Card.Header>
      <Card.Content className="overflow-x-auto max-w-[500px]">
        {data.details != null && (
          <JsonViewer
            shouldSortObjectKeys={false}
            shouldExpandNodeInitially={() => true}
            data={{
              ...data.details,
              creditsUsed: data.creditsUsed,
              created: toLocaleStringOrUndefined(data.createdAt),
              project: data.project
                ? {
                    id: data.project.id,
                    name: data.project.name,
                  }
                : null,
              workflow: data.workflow
                ? {
                    id: data.workflow.id,
                    name: data.workflow.name,
                  }
                : null,
              agent: data.agent
                ? {
                    id: data.agent.id,
                    name: data.agent.name,
                  }
                : null,
              task: data.task
                ? {
                    id: data.task.id,
                    name: data.task.name,
                  }
                : null,
              execution: data.execution
                ? {
                    id: data.execution.id,
                    executionNumber: data.execution.executionNumber,
                  }
                : null,
              knowledge: data.knowledge
                ? {
                    id: data.knowledge.id,
                    name: data.knowledge.name,
                  }
                : null,
            }}
          />
        )}
      </Card.Content>
      <Card.Footer className="flex justify-end">
        <Dialog.Close>
          <Button>Done</Button>
        </Dialog.Close>
      </Card.Footer>
    </Card>
  );
}
