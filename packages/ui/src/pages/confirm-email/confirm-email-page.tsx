import { zodResolver } from '@hookform/resolvers/zod';
import React, { useCallback } from 'react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { z } from 'zod';

import { api } from '../../api/api-library';
import { Icons } from '../../components/icons';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Form } from '../../components/ui/form';
import { InputOTP } from '../../components/ui/input-otp';

const confirmEmailPinSchema = z.object({
  pin: z.string().min(6, {
    message: 'Your one-time password must be 6 characters.',
  }),
});

type ConfirmEmailPin = z.infer<typeof confirmEmailPinSchema>;

export default function ConfirmEmailPage() {
  const form = useForm<ConfirmEmailPin>({
    resolver: zodResolver(confirmEmailPinSchema),
    defaultValues: {
      pin: '',
    },
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isResending, setIsResending] = React.useState(false);
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
  const [countdown, setCountdown] = React.useState(60);
  const pinValue = form.watch('pin');
  const navigate = useNavigate();

  const handleResend = async () => {
    if (!email) return;

    setIsResending(true);
    const { data: successfulResend } = await api.auth.resendEmailVerification({
      email,
    });
    setIsResending(false);

    if (successfulResend) {
      setCountdown(60);
    }
  };

  const onSubmit = useCallback(
    async (data: ConfirmEmailPin) => {
      setIsSubmitting(true);

      const { data: tokenResponse, error } =
        await api.auth.validateEmailVerificationToken({
          email: email ?? '',
          token: data.pin,
        });

      if (error) {
        form.setError('pin', {
          type: 'manual',
          message: 'Invalid pin',
        });
      } else if (tokenResponse) {
        navigate(`/verify-token?token=${tokenResponse}`);
      }

      setIsSubmitting(false);
    },
    [email, form, navigate],
  );

  useEffect(() => {
    if (pinValue.length === 6) {
      form.handleSubmit(onSubmit)();
    } else {
      form.clearErrors('pin');
    }
  }, [form, onSubmit, pinValue]);

  useEffect(() => {
    //Start a countdown from 60 seconds to resend email

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 0) return 0;
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card className="border-none bg-background">
          <Card.Header>
            <Card.Title className="leading-0 text-lg md:text-xl">
              <span className="mr-2">Welcome to Lecca.io!</span> 🎉
            </Card.Title>
          </Card.Header>
          <Card.Content>
            <Card.Title className="font-normal">
              {email ? (
                <>
                  <span>Let's confirm your email,</span>{' '}
                  <strong>{email}</strong>
                </>
              ) : (
                "Let's confirm your email"
              )}
            </Card.Title>
            <br />
            <Form.Field
              control={form.control}
              name="pin"
              render={({ field }) => (
                <Form.Item className="flex items-start flex-col justify-center">
                  <div className="flex items-center">
                    <InputOTP
                      maxLength={6}
                      {...field}
                      autoFocus
                      disabled={isSubmitting}
                    >
                      <InputOTP.Group>
                        <InputOTP.Slot index={0} />
                        <InputOTP.Slot index={1} />
                        <InputOTP.Slot index={2} />
                        <InputOTP.Slot index={3} />
                        <InputOTP.Slot index={4} />
                        <InputOTP.Slot index={5} />
                      </InputOTP.Group>
                    </InputOTP>
                    {/* Loading spinner */}
                    {isSubmitting && (
                      <Icons.spinner className="size-5 animate-spin ml-2" />
                    )}
                  </div>
                  <Form.Message />
                </Form.Item>
              )}
            ></Form.Field>
            <Card.Description className="mt-4">
              Please enter the 6-digit code sent to your email
            </Card.Description>
          </Card.Content>
          {email && (
            <Card.Footer>
              <div className="flex space-x-2">
                <Button
                  disabled={countdown > 0 || isSubmitting}
                  onClick={handleResend}
                  loading={isResending}
                >
                  Resend email{' '}
                  {countdown > 0 && (
                    <>
                      ({countdown} {countdown === 1 ? 'second' : 'seconds'})
                    </>
                  )}
                </Button>
              </div>
            </Card.Footer>
          )}
        </Card>
      </form>
    </Form>
  );
}
