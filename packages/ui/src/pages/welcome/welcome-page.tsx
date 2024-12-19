import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

import { api } from '../../api/api-library';
import { GoogleSignIn } from '../../components/google-sign-in';
import { Button, buttonVariants } from '../../components/ui/button';
import { Form } from '../../components/ui/form';
import { Input } from '../../components/ui/input';
import { useUser } from '../../hooks/useUser';
import { CreateUserType, createUserSchema } from '../../models/user-model';
import { cn } from '../../utils/cn';

export function WelcomePage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { initializeUserContextData } = useUser();

  const form = useForm<CreateUserType>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: CreateUserType) => {
    setIsSubmitting(true);

    const { data: successfulSignup, error } =
      await api.auth.signupWithEmail(values);

    if (successfulSignup?.result) {
      const email = values.email;
      const password = values.password;

      if (successfulSignup?.verified) {
        const { data: loggedInSuccessfully } = await api.auth.loginWithEmail({
          email,
          password,
        });

        if (loggedInSuccessfully) {
          await initializeUserContextData();
          navigate('/', { replace: true });
        } else {
          navigate(`/login`);
        }
      } else {
        navigate(`/confirm-email?email=${email}`, { replace: true });
      }
    } else if (error) {
      form.setError('email', {
        type: 'manual',
        message: error as unknown as string,
      });
    }

    setIsSubmitting(false);
  };

  return (
    <div className="container relative h-dvh flex flex-col items-center justify-center">
      <Link
        to="/login"
        className={cn(
          buttonVariants({ variant: 'ghost' }),
          'absolute right-4 top-4 md:right-8 md:top-8',
        )}
      >
        Login
      </Link>
      <div className="w-full sm:w-[350px] space-y-4">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Create an account
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your information below to create your account
          </p>
        </div>
        <div className={cn('grid gap-6')}>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid gap-4">
                <Form.Field
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Control>
                        <Input autoFocus placeholder="Name" {...field} />
                      </Form.Control>
                      <Form.Message />
                    </Form.Item>
                  )}
                />
                <Form.Field
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Control>
                        <Input
                          type="email"
                          placeholder="Email address"
                          {...field}
                        />
                      </Form.Control>
                      <Form.Message />
                    </Form.Item>
                  )}
                />
                <Form.Field
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Control>
                        <Input
                          type="password"
                          placeholder="Password"
                          {...field}
                        />
                      </Form.Control>
                      <Form.Message />
                    </Form.Item>
                  )}
                />
                <Button loading={isSubmitting}>Create Account</Button>
              </div>
            </form>
          </Form>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>
          <div className="grid gap-2">
            <GoogleSignIn />
            <Button
              variant="ghost"
              type="button"
              onClick={() => navigate('/login')}
            >
              Sign in with Email
            </Button>
          </div>
        </div>
        <p className="text-center text-sm text-muted-foreground">
          By continuing, you agree to our
          <br />
          <a
            href="https://www.lecca.io/terms"
            className="underline underline-offset-4 hover:text-primary"
          >
            Terms of Service
          </a>{' '}
          and{' '}
          <a
            href="https://www.lecca.io/privacy"
            className="underline underline-offset-4 hover:text-primary"
          >
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </div>
  );
}
