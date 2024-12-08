import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import useApiMutation from '@/api/use-api-mutation';
import useApiQuery from '@/api/use-api-query';
import { toast } from '@/hooks/useToast';
import {
  UploadRawTextKnowledgeType,
  uploadRawTextKnowledgeSchema,
} from '@/models/knowledge-model';

import { Icons } from '../icons';
import { AutosizeTextarea } from '../ui/autosize-textarea';
import { Button } from '../ui/button';
import { Dialog } from '../ui/dialog';
import { Form } from '../ui/form';
import { Input } from '../ui/input';

import { UploadKnowledgeAdvancedSettingsCollapsableField } from './upload-file-knowledge-form';

export function UploadRawTextKnowledgeForm({
  knowledgeId,
}: {
  knowledgeId: string;
}) {
  const [uploadStatus, setUploadStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');

  const form = useForm<UploadRawTextKnowledgeType>({
    resolver: zodResolver(uploadRawTextKnowledgeSchema),
    defaultValues: {
      name: '',
      text: '',
    },
  });

  const { data: knowledge } = useApiQuery({
    service: 'knowledge',
    method: 'getById',
    apiLibraryArgs: {
      id: knowledgeId,
    },
  });

  const saveUploadedTextToKnowledgeMutation = useApiMutation({
    service: 'knowledge',
    method: 'saveUploadedTextToKnowledge',
    apiLibraryArgs: {
      knowledgeId: knowledgeId!,
    },
  });
  const onSubmit = useCallback(async () => {
    setUploadStatus('loading');

    const text = form.getValues('text');

    await saveUploadedTextToKnowledgeMutation.mutateAsync(
      {
        data: {
          name: form.getValues('name'),
          text: text,
          chunkSize: form.getValues('chunkSize'),
          chunkOverlap: form.getValues('chunkOverlap'),
        },
      },
      {
        onSuccess: () => {
          setUploadStatus('success');
          toast({
            title: 'Data is being processed.',
            variant: 'default',
          });
        },
        onError: () => {
          setUploadStatus('error');
        },
      },
    );
  }, [form, saveUploadedTextToKnowledgeMutation]);

  useEffect(() => {
    if (knowledge) {
      form.reset({
        name: '',
        text: '',
        chunkSize: knowledge.chunkSize,
        chunkOverlap: knowledge.chunkOverlap,
      });
    }
  }, [form, knowledge]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
        {uploadStatus === 'success' ? (
          <SuccessFormContent />
        ) : uploadStatus === 'error' ? (
          <ErrorFormContent />
        ) : (
          <>
            <Form.Header className="pb-5">
              <Form.Title>New Data</Form.Title>
              <Form.Subtitle>
                Add your own data to your knowledge notebook
              </Form.Subtitle>
            </Form.Header>

            <Form.Content className="space-y-6">
              <Form.Field
                control={form.control}
                name="name"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>Name</Form.Label>
                    <Form.Control>
                      <Input
                        {...field}
                        placeholder="Add a name"
                        spellCheck={false}
                      />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
              <Form.Field
                control={form.control}
                name="text"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>Data</Form.Label>
                    <Form.Control>
                      <AutosizeTextarea
                        {...field}
                        maxHeight={400}
                        placeholder="Add text"
                      />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
              <UploadKnowledgeAdvancedSettingsCollapsableField form={form} />
            </Form.Content>
            <Form.Footer className="space-x-2 flex justify-end">
              <Dialog.Close asChild>
                <Button
                  type="button"
                  onClick={form.handleSubmit(onSubmit)}
                  variant="default"
                  loading={uploadStatus === 'loading'}
                  disabled={
                    !form.formState.isValid || uploadStatus === 'loading'
                  }
                >
                  Upload
                </Button>
              </Dialog.Close>
            </Form.Footer>
          </>
        )}
      </form>
    </Form>
  );
}

function SuccessFormContent() {
  return (
    <>
      <Form.Content>
        <div className="flex flex-col items-center space-y-2 pb-4 pt-8 ">
          <Icons.check className="w-12 h-12 text-success" />
          <Form.Title>Data Uploaded</Form.Title>
          <Form.Description>
            Your data is now in your knowledge notebook
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

function ErrorFormContent() {
  return (
    <>
      <Form.Content>
        <div className="flex flex-col items-center space-y-2 pb-4 pt-8 ">
          <Icons.x className="w-12 h-12 text-error" />
          <Form.Title>Upload failed</Form.Title>
          <Form.Description className="text-center">
            Could not upload data. Please try again.
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
