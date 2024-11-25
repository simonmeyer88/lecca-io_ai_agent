import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { z } from 'zod';

import useApiQuery from '@/api/use-api-query';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { ComboBox } from '@/components/ui/combo-box';
import { Dialog } from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { Skeleton } from '@/components/ui/skeleton';

const selectAgentSchema = z.object({
  knowledgeId: z.string().uuid(),
});

type SelectAgentType = z.infer<typeof selectAgentSchema>;

type Props = {
  onSubmit: (values: SelectAgentType) => void;
  enabledKnowledgeIds: string[] | undefined;
};

export function AddAgentKnowledgeForm({
  onSubmit: onSubmitCallback,
  enabledKnowledgeIds = [],
}: Props) {
  const { projectId } = useParams();
  const [enableStatus, setEnableStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');

  const { data: knowledge, isLoading: isLoadingKnowledge } = useApiQuery({
    service: 'knowledge',
    method: 'getList',
    apiLibraryArgs: {
      config: {
        params: {
          filterBy: [`projectAccessId:${projectId}`],
        },
      },
    },
  });

  const unselectedKnowledge = useMemo(() => {
    return knowledge?.filter((k) => !enabledKnowledgeIds.includes(k.id)) ?? [];
  }, [knowledge, enabledKnowledgeIds]);

  const form = useForm<SelectAgentType>({
    resolver: zodResolver(selectAgentSchema),
    defaultValues: {},
  });

  const onSubmit = (values: SelectAgentType) => {
    onSubmitCallback(values);
    setEnableStatus('success');
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
        {enableStatus === 'success' ? (
          <SuccessFormContent
            onEnableAgain={() => {
              setEnableStatus('idle');
              form.reset();
            }}
          />
        ) : enableStatus === 'error' ? (
          <ErrorFormContent />
        ) : (
          <>
            <Form.Header className="pb-5">
              <Form.Title>Enable Knowledge</Form.Title>
              <Form.Subtitle>
                Give your agent access to this knowledge
              </Form.Subtitle>
            </Form.Header>
            <Form.Content className="space-y-6">
              <Form.Field
                control={form.control}
                name="knowledgeId"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Control>
                      <div className="flex flex-col space-y-2">
                        {isLoadingKnowledge ? (
                          <>
                            <Form.Label>Knowledge</Form.Label>
                            <Skeleton className="w-full h-10" />
                          </>
                        ) : unselectedKnowledge?.length ? (
                          <>
                            <Form.Label>Knowledge</Form.Label>
                            <div className="flex space-x-1 items-center">
                              <ComboBox
                                dropdownWidthMatchesButton
                                className="w-full flex justify-between"
                                fallbackLabel="Select knowledge"
                                searchable={true}
                                items={unselectedKnowledge?.map((k) => ({
                                  label: k.name,
                                  value: k.id,
                                }))}
                                defaultSelectedItem={{
                                  label: field.value
                                    ? unselectedKnowledge?.find(
                                        (k) => k.id === field.value,
                                      )?.name ?? 'Unknown knowledge'
                                    : '',
                                  value: field.value,
                                }}
                                searchLabel="Search knowledge"
                                onChange={field.onChange}
                              />
                            </div>
                          </>
                        ) : (
                          <div className="space-y-2">
                            <Form.Description>
                              No knowledge available.
                            </Form.Description>
                            {/* <Button
                              //   onClick={() => setShowCreateProjectForm(true)}
                              onClick={() => {}}
                              variant={'outline'}
                            >
                              Create New Knowledge
                            </Button> */}
                          </div>
                        )}
                      </div>
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
            </Form.Content>
            <Form.Footer className="space-x-2 flex justify-end">
              <Dialog.Close asChild>
                <Button
                  type="button"
                  onClick={form.handleSubmit(onSubmit)}
                  variant="default"
                  loading={enableStatus === 'loading'}
                  disabled={!form.formState.isValid}
                >
                  Enable
                </Button>
              </Dialog.Close>
            </Form.Footer>
          </>
        )}
      </form>
    </Form>
  );
}

function SuccessFormContent({ onEnableAgain }: { onEnableAgain: () => void }) {
  return (
    <>
      <Form.Content>
        <div className="flex flex-col items-center space-y-2 pb-4 pt-8 ">
          <Icons.check className="w-12 h-12 text-success" />
          <Form.Title>Knowledge enabled</Form.Title>
          <Form.Description>
            The agent now has access to this knowledge.
          </Form.Description>
        </div>
      </Form.Content>
      <Form.Footer className="space-x-2 flex justify-end">
        <Dialog.Close asChild>
          <Button variant="outline">Done</Button>
        </Dialog.Close>
        <Button variant="default" type="button" onClick={onEnableAgain}>
          Enable Another
        </Button>
      </Form.Footer>
    </>
  );
}

function ErrorFormContent() {
  return (
    <>
      <Form.Content>
        <div className="flex flex-col items-center space-y-2 pb-4 pt-8 ">
          <Icons.x className="w-12 h-12 text-error" />
          <Form.Title>Failure</Form.Title>
          <Form.Description className="text-center">
            Could not enable knowledge for this agent.
          </Form.Description>
        </div>
      </Form.Content>
      <Form.Footer className="space-x-2 flex justify-end">
        <Dialog.Close asChild>
          <Button variant="outline">Done</Button>
        </Dialog.Close>
      </Form.Footer>
    </>
  );
}
