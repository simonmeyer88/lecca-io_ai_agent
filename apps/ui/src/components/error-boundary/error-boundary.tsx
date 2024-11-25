import React, { ErrorInfo } from 'react';

import { Icons } from '../icons';
import { Button } from '../ui/button';
import { Dialog } from '../ui/dialog';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state to trigger fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error, e.g., to an error reporting service
    console.error('Error caught in error boundary: ', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-full p-6">
          <div>
            <Icons.alertCircle className="w-16 h-16" />
          </div>
          <h1 className="text-2xl font-bold my-4">
            Oops! Something went wrong.
          </h1>
          <div className="flex space-x-2">
            <Button onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
            <Dialog>
              <Dialog.Trigger asChild>
                <Button variant={'ghost'}>View Details</Button>
              </Dialog.Trigger>
              <Dialog.Content className="p-6 text-sm">
                {this.state.error?.message}
              </Dialog.Content>
            </Dialog>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
