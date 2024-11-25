import { zodResolver } from '@hookform/resolvers/zod';
import React, { useCallback } from 'react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';

import { api } from '@/api/api-library';
import { Icons } from '@/components/icons';
import { Card } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { InputOTP } from '@/components/ui/input-otp';
import { useUser } from '@/hooks/useUser';

const confirmEmailPinSchema = z.object({
  betaKey: z.string().min(4, {
    message: 'Incorrect key',
  }),
});

type ConfirmEmailPin = z.infer<typeof confirmEmailPinSchema>;

export default function BetaPage() {
  const { workspace, setWorkspace } = useUser();

  const form = useForm<ConfirmEmailPin>({
    resolver: zodResolver(confirmEmailPinSchema),
    defaultValues: {
      betaKey: '',
    },
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const betaKey = form.watch('betaKey');
  const navigate = useNavigate();

  const onSubmit = useCallback(
    async (data: ConfirmEmailPin) => {
      setIsSubmitting(true);

      const { data: betaKeyResponse, error } =
        await api.workspaces.validateWorkspaceBetaKey({
          betaKey: data.betaKey,
        });

      if (error) {
        form.setError('betaKey', {
          type: 'manual',
          message: 'Invalid Key',
        });
      } else if (betaKeyResponse) {
        workspace!.inBeta = true;
        setWorkspace(workspace!);

        navigate(`/onboarding`);
      }

      setIsSubmitting(false);
    },
    [form, navigate, setWorkspace, workspace],
  );

  useEffect(() => {
    if (betaKey.length === 4) {
      form.handleSubmit(onSubmit)();
    } else {
      form.clearErrors('betaKey');
    }
  }, [form, onSubmit, betaKey]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card className="border-none bg-background">
          <Card.Header>
            <Card.Title className="leading-0 text-lg md:text-xl">
              <span className="mr-2">Beta Access</span>
            </Card.Title>
          </Card.Header>
          <Card.Content>
            <Card.Title className="font-normal">
              Please enter the 4-digit key to access the beta
            </Card.Title>
            <br />
            <Form.Field
              control={form.control}
              name="betaKey"
              render={({ field }) => (
                <Form.Item className="flex items-start flex-col justify-center">
                  <div className="flex items-center">
                    <InputOTP
                      maxLength={4}
                      {...field}
                      autoFocus
                      disabled={isSubmitting}
                    >
                      <InputOTP.Group>
                        <InputOTP.Slot index={0} />
                        <InputOTP.Slot index={1} />
                        <InputOTP.Slot index={2} />
                        <InputOTP.Slot index={3} />
                      </InputOTP.Group>
                    </InputOTP>
                    {isSubmitting && (
                      <Icons.spinner className="size-5 animate-spin ml-2" />
                    )}
                  </div>
                  <Form.Message />
                </Form.Item>
              )}
            ></Form.Field>
            <Card.Description className="mt-4">
              Email support@lecca.io for a beta key.
            </Card.Description>
          </Card.Content>
        </Card>
      </form>
    </Form>
  );
}
