import { useState } from 'react';
import { Link } from 'react-router-dom';

import { api } from '../../../../../../../api/api-library';
import { Icons } from '../../../../../../../components/icons';
import { Button } from '../../../../../../../components/ui/button';
import { Card } from '../../../../../../../components/ui/card';
import { Dialog } from '../../../../../../../components/ui/dialog';
import { useProjectWorkflow } from '../../../../../../../hooks/useProjectWorkflow';
import { useToast } from '../../../../../../../hooks/useToast';

/**
 * Not actually a node, but appears on the canvas like an node
 */
export function CheckPollingTriggerNode({
  executionId,
  projectId,
}: {
  executionId: string | undefined;
  projectId: string;
}) {
  const { runSingleNode, saveWorkflow } = useProjectWorkflow();
  const { toast } = useToast();
  const [executionIds, setExecutionIds] = useState<string[]>([]);
  const [runStatus, setRunStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');

  const onSubmit = async () => {
    if (saveWorkflow === undefined || runSingleNode === undefined) {
      return;
    }

    setRunStatus('loading');
    try {
      const savedWorkflowResponse = await saveWorkflow();

      //The workflowId might've not existed until now when we saved the workflow
      //because this could've been a new workflow.
      const newOrExistingWorkflowId = savedWorkflowResponse?.id;

      if (newOrExistingWorkflowId) {
        const { data, error } =
          await api.workflows.checkForLatestPllingItemAndRun({
            workflowId: newOrExistingWorkflowId,
          });

        if (data) {
          setRunStatus('success');
          setExecutionIds(data.executionIds);
        } else {
          throw new Error(error);
        }
        setRunStatus('success');
      } else {
        throw new Error('Failed to save workflow');
      }
    } catch (e: any) {
      setRunStatus('error');
      toast({
        title: e.message ?? 'Failed to check run trigger checks.',
        variant: 'destructive',
      });
    }
  };

  return projectId && !executionId ? (
    <Dialog
      onOpenChange={(open) => {
        if (!open) {
          setRunStatus('idle');
        }
      }}
    >
      <Dialog.Trigger>
        <div className="absolute -left-12 top-1/2 -translate-y-1/2 border flex items-center action-node !w-[unset] !p-2 space-x-1 bg-background hover:border-blue-400 shadow-sm group">
          <Icons.play className="size-3 group-hover:text-blue-400" />
        </div>
      </Dialog.Trigger>
      <Dialog.Content>
        {runStatus === 'success' ? (
          <SuccessFormContent
            projectId={projectId}
            executionIds={executionIds}
          />
        ) : runStatus === 'error' ? (
          <ErrorFormContent />
        ) : (
          <Card className="border-none">
            <Card.Header>
              <Card.Title>Run Trigger Check</Card.Title>
            </Card.Header>
            <Card.Content>
              <Card.Description>
                Instead of waiting for the next polling cycle, you can
                immediately check if there are new items and run the workflow.
              </Card.Description>
            </Card.Content>
            <Card.Footer className="space-x-2 flex justify-end">
              <Dialog.Close asChild>
                <Button variant="outline">Close</Button>
              </Dialog.Close>
              <Button
                variant="default"
                loading={runStatus === 'loading'}
                onClick={onSubmit}
              >
                Check & Run
              </Button>
            </Card.Footer>
          </Card>
        )}
      </Dialog.Content>
    </Dialog>
  ) : null;
}

function SuccessFormContent({
  executionIds,
  projectId,
}: {
  executionIds: string[];
  projectId: string;
}) {
  return (
    <Card className="border-none">
      <Card.Content>
        <div className="flex flex-col items-center space-y-2 pt-8 ">
          <Icons.zap className="size-6 mb-4" />
          {executionIds.length > 0 ? (
            <>
              <Card.Title>Successfully Checked</Card.Title>
              <Card.Description>
                {executionIds.length}{' '}
                {executionIds.length === 1
                  ? 'execution was'
                  : 'executions were'}
                {' successfully triggered.'}
                <br />
                {executionIds.length === 1 ? (
                  <div className="text-primary pt-2">
                    You can view the workflow execution{' '}
                    <Link
                      to={`/projects/${projectId}/executions/${executionIds[0]}`}
                      className="underline"
                    >
                      here
                    </Link>
                  </div>
                ) : (
                  <>
                    You can view the new executions on the executions page{' '}
                    <Link
                      to={`/projects/${projectId}/executions`}
                      className="underline"
                    >
                      here
                    </Link>
                  </>
                )}
              </Card.Description>
            </>
          ) : (
            <Card.Title>No new items found</Card.Title>
          )}
        </div>
      </Card.Content>
      <Card.Footer className="space-x-2 flex justify-end">
        <Dialog.Close asChild>
          <Button variant="outline">Done</Button>
        </Dialog.Close>
      </Card.Footer>
    </Card>
  );
}

function ErrorFormContent() {
  return (
    <Card className="border-none">
      <Card.Content>
        <div className="flex flex-col items-center space-y-2 pt-8 ">
          <Icons.x className="w-12 h-12 text-error" />
          <Card.Description className="text-center">
            Something went wrong. Double check your workflow is active.
          </Card.Description>
        </div>
      </Card.Content>
      <Card.Footer className="space-x-2 flex justify-end">
        <Dialog.Close asChild>
          <Button variant="outline">Done</Button>
        </Dialog.Close>
      </Card.Footer>
    </Card>
  );
}
