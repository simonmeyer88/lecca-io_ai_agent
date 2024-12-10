import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { z } from 'zod';

import { api } from '../../api/api-library';
import { Icons } from '../../components/icons';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Form } from '../../components/ui/form';
import { Input } from '../../components/ui/input';

const resetPasswordSchema = z.object({
  password: z.string().min(6, {
    message: 'Email required',
  }),
});

type ResetPassword = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const form = useForm<ResetPassword>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
    },
  });

  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const navigate = useNavigate();

  const onSubmit = async (data: ResetPassword) => {
    setIsSubmitting(true);

    await api.auth.resetPassword({
      password: data.password,
      token: token ?? '',
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
              <span className="mr-2">Password reset!</span>
            </Card.Title>
            <Card.Description>
              <span className="mr-2">
                Your password was reset. Please login with your new password.
              </span>
            </Card.Description>
          </Card.Header>
          <Card.Footer>
            <Button
              onClick={() => {
                navigate('/login');
              }}
            >
              <span>Login</span>
              <Icons.arrowRight className="ml-2" />
            </Button>
          </Card.Footer>
        </Card>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Card className="border-none bg-background">
              <Card.Header>
                <Card.Title className="leading-0 text-lg md:text-xl">
                  <span className="mr-2">Reset password</span>
                </Card.Title>
              </Card.Header>
              <Card.Content>
                <Form.Field
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <Form.Item className="flex items-start flex-col justify-center">
                      <div className="flex items-center">
                        <Input
                          {...field}
                          autoFocus
                          disabled={isSubmitting}
                          className="w-96"
                          type="password"
                          placeholder="Enter new password"
                        />
                      </div>
                      <Form.Message />
                    </Form.Item>
                  )}
                ></Form.Field>
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
                    Reset
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
