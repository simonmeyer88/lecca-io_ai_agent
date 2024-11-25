import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Icons } from '../icons';
import { Button } from '../ui/button';
import { Dialog } from '../ui/dialog';
import { Form } from '../ui/form';
import { Textarea } from '../ui/textarea';

const feedbackSchema = z.object({
  feedback: z.string().min(1, { message: "You didn't provide any feedback." }),
});

type FeedbackType = z.infer<typeof feedbackSchema>;

export function FeedbackForm() {
  const [createStatus, setCreateStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');
  const form = useForm<FeedbackType>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      feedback: '',
    },
  });

   
  const onSubmit = async (_data: FeedbackType) => {
    setCreateStatus('loading');
    setTimeout(() => {
      //TODO: send feedback to the server
      setCreateStatus('success');
    }, 1000);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
        {createStatus === 'success' ? (
          <SuccessFormContent />
        ) : createStatus === 'error' ? (
          <ErrorFormContent />
        ) : (
          <>
            <Form.Header className="pb-5">
              <Form.Title>Feedback</Form.Title>
              <Form.Subtitle>
                Help us improve by providing your feedback.
              </Form.Subtitle>
            </Form.Header>
            <Form.Content className="space-y-6">
              <Form.Field
                control={form.control}
                name="feedback"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Control>
                      <Textarea
                        {...field}
                        placeholder="Your feedback..."
                        rows={10}
                      />
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
                  loading={createStatus === 'loading'}
                  disabled={!form.formState.isValid}
                >
                  Send
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
          <Form.Title>Feedback sent</Form.Title>
          <Form.Description>
            Thank you for your feedback. We will review it shortly.
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
          <Form.Title>Unable to send feedback</Form.Title>
          <Form.Description className="text-center">
            Please try again later or contact support.
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
