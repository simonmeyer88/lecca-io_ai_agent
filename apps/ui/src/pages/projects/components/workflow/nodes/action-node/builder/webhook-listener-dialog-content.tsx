import { useEffect, useMemo, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Node, useReactFlow } from 'reactflow';

import { api } from '@/api/api-library';
import { Icons } from '@/components/icons';
import { JsonViewer } from '@/components/json-viewer';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/useToast';
import { Agent } from '@/models/agent/agent-model';
import { Workflow } from '@/models/workflow/workflow-model';

export function WebhookListenerDialogContent({
  workflowId,
  node,
  form,
  onSubmit,
}: {
  workflowId: string | undefined;
  node: Node;
   
  form: UseFormReturn<any, any, undefined>;
   
  onSubmit: ((values: any) => Promise<Workflow | Agent>) | undefined;
}) {
  const { setNodes } = useReactFlow();

  const [pollingState, setPollingState] = useState<
    'setting-up' | 'polling' | 'finished' | 'error'
  >('setting-up');

  const { toast } = useToast();

  const webhookUrl = useMemo(() => {
    if (!workflowId) return undefined;
    if (node.data.triggerId !== 'flow-control_trigger_listen-for-webhook') {
      // This dialog should only be used for the webhook listener node
      // If it's an app specific trigger, then we don't show the url, because the user
      // isn't going to actually send a webhook. Theyll trigger the activity to have the app send the webhook

      //By returning undefined, we'll show a different message below
      return undefined;
    }

    const serverUrl = import.meta.env.VITE_SERVER_URL;
    return `${serverUrl}/webhooks/workflows/${workflowId}`;
  }, [node.data, workflowId]);

  useEffect(() => {
    if (!workflowId) return;

    // Initial API call to start the server listening
    const startListening = async () => {
      form.handleSubmit(async (values) => {
        if (onSubmit) {
          await onSubmit(values);

          //Then in the dialog content, we'll set the workflow to listening for webhook test
          //and we'll poll the server for the webhook data
        }

        const { isError, error } = await api.workflows.setTestingWebhookToTrue({
          id: workflowId,
        });

        if (isError) {
          toast({
            title: error,
            variant: 'destructive',
          });
        } else {
          setPollingState('polling'); // Start polling after the initial call is successful
        }
      })();
    };

    startListening();
    //form, onBusmit, toast causes infinite loop. Doesn't matter though because fom, onSubmit, and toast won't change when this dialog is open
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    // form,
    // onSubmit,
    // toast,
    workflowId,
  ]);

  useEffect(() => {
    if (pollingState !== 'polling' || !workflowId) return;

    // Polling function
    const pollEndpoint = async () => {
      const { data, error } = await api.workflows.getTestWebhookData({
        id: workflowId,
      });

      if (data?.hasData) {
        setPollingState('finished');
        toast({
          title: 'Webhook received',
        });

        clearInterval(interval); // Clear the interval when condition is met

        setNodes((prevNodes) => {
          return prevNodes.map((_node) => {
            if (_node.id === node.id) {
              return {
                ..._node,
                data: {
                  ..._node.data,
                  output: data.data,
                },
              };
            } else {
              return _node;
            }
          });
        });
      } else if (data?.hasData === false) {
        // Continue polling
      } else {
        // Error
        setPollingState('error');
        toast({
          title: 'Error polling for webhook data',
          description: error,
          variant: 'destructive',
        });
        clearInterval(interval); // Clear the interval when error occurs
      }
    };

    const interval = setInterval(pollEndpoint, 5000); // Adjust the interval as needed

    return () => clearInterval(interval); // Clear the interval when the component unmounts or polling stops

    //setNodes is commented out because it causes an infinite loop.
    //It's fine to comment out because we're not updating other nodes when the dialog is open.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    // setNodes,
    node.id,
    pollingState,
    toast,
    workflowId,
  ]);

  return (
    <div className="p-6 flex flex-col space-y-4">
      <Dialog.Header className="flex flex-row items-center ">
        {pollingState === 'polling' && (
          <>
            <div className="mr-2">Listening for Webhook</div>
            <Icons.spinner className="animate-spin size-5 !m-0" />
          </>
        )}
        {pollingState === 'finished' && (
          <>
            <div className="mr-2">Webhook received</div>
            <Icons.check className="text-green-500 size-5 !m-0" />
          </>
        )}
      </Dialog.Header>
      <div className="flex flex-col space-x-1 items-center">
        {webhookUrl ? (
          <>
            <div className="w-full flex flex-row items-center">
              <Textarea
                value={webhookUrl}
                readOnly={true}
                className="resize-none !border-none !outline-0 !ring-0 bg-muted"
              />
              <Button
                variant="ghost"
                size="sm"
                className="px-1.5 py-4"
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(webhookUrl ?? '');
                }}
              >
                <Icons.copy className="w-4 h-4" />
              </Button>
            </div>
            {pollingState === 'polling' && (
              <div className="text-muted-foreground py-4 text-sm">
                Make an HTTP POST, PUT, or GET request to your webhook URL to
                test it. When the webhook receives data, that data will be
                displayed here. You can then map that output to other actions in
                your workflow.
              </div>
            )}
          </>
        ) : (
          pollingState === 'polling' && (
            <div className="text-muted-foreground text-sm">
              Perform the action that would trigger this step. We are listening
              and will show you the data of that webhook once we receive the
              data.
              <br />
              <br />
              Make sure your workflow is <strong>Active</strong>.
            </div>
          )
        )}
      </div>
      {pollingState === 'finished' && (
        <ScrollArea className="max-h-96 overflow-y-auto">
            <div className="flex flex-col ">
              <JsonViewer data={node.data.output} />
            </div>
          </ScrollArea>
      )}
      {pollingState === 'error' && (
        <div className="text-muted-foreground text-center py-4 text-sm">
          Error polling for webhook data
        </div>
      )}
    </div>
  );
}
