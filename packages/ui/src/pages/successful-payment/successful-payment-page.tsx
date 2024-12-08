import React from 'react';
import { Link } from 'react-router-dom';

import { Icons } from '@/components/icons';
import { Loader } from '@/components/loaders/loader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useUser } from '@/hooks/useUser';

export function SuccessfulPaymentPage() {
  const { initializeUserContextData } = useUser();
  const [
    isFetchingUpdatedUserContextData,
    setIsFetchingUpdatedUserContextData,
  ] = React.useState(false);

  React.useEffect(() => {
    initializeUserContextData().then(() => {
      setIsFetchingUpdatedUserContextData(false);
    });
  }, [initializeUserContextData]);

  if (isFetchingUpdatedUserContextData) {
    return <Loader />;
  }

  return (
    <Card className="border-none bg-background relative">
      <Card.Header>
        <Card.Title className="flex items-center space-x-1">
          <span>You're all set!</span>
          <span role="img" aria-label="fireworks">
            🎉
          </span>
        </Card.Title>
        <Card.Description>
          Your subscription has been successfully processed.
        </Card.Description>
      </Card.Header>
      <Card.Footer className="flex justify-between space-x-2">
        <div>
          <Button variant={'outline'} asChild>
            <Link to="/" className="space-x-2">
              <Icons.arrowLeft />
              <span>Workspace</span>
            </Link>
          </Button>
        </div>
      </Card.Footer>
    </Card>
  );
}
