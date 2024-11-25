import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';

import { api } from '@/api/api-library';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const forgotPasswordSchema = z.object({
  email: z.string().min(6, {
    message: 'Email required',
  }),
});

type ForgotPassword = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const form = useForm<ForgotPassword>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const navigate = useNavigate();

  const onSubmit = async (data: ForgotPassword) => {
    setIsSubmitting(true);

    await api.auth.sendForgotPasswordEmail({
      email: data.email ?? '',
    });

    setSubmitted(true);
    setIsSubmitting(false);
  };

  return (
    <div className="container relative h-dvh flex flex-col items-center justify-center">
      {submitted ? (
        <Card className="border-none bg-background max-w-lg">
          <Card.Header>
            <Card.Title className="leading-0 text-lg md:text-xl">
              <span className="mr-2">All set!</span>
            </Card.Title>
            <Card.Description>
              <span className="mr-2">
                We've sent reset instructions to the email provided if it's in
                our system. Please check your email and follow the steps.
              </span>
            </Card.Description>
          </Card.Header>
          <Card.Footer>
            <Button
              onClick={() => {
                navigate('/login');
              }}
            >
              <Icons.arrowLeft className="mr-2" />
              <span>Back to Login</span>
            </Button>
          </Card.Footer>
        </Card>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Card className="border-none bg-background">
              <Card.Header>
                <Card.Title className="leading-0 text-lg md:text-xl">
                  <span className="mr-2">Forgot your password?</span>
                </Card.Title>
              </Card.Header>
              <Card.Content>
                <Form.Field
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <Form.Item className="flex items-start flex-col justify-center">
                      <div className="flex items-center">
                        <Input
                          {...field}
                          autoFocus
                          disabled={isSubmitting}
                          className="w-96"
                          placeholder="Enter email address"
                        />
                      </div>
                      <Form.Message />
                    </Form.Item>
                  )}
                ></Form.Field>
                <Card.Description className="mt-4">
                  We'll send a reset link to your email.
                </Card.Description>
              </Card.Content>
              <Card.Footer>
                <div className="flex space-x-2 justify-between w-full">
                  <Button
                    variant={'outline'}
                    type="button"
                    onClick={() => {
                      navigate('/login');
                    }}
                  >
                    <Icons.arrowLeft className="mr-2" />
                    <span>Back to Login</span>
                  </Button>
                  <Button disabled={isSubmitting} loading={isSubmitting}>
                    Submit
                  </Button>
                </div>
              </Card.Footer>
            </Card>
          </form>
        </Form>
      )}
    </div>
  );
}
