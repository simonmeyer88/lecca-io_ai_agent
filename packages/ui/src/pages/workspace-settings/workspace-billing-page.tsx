import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { api } from '../../api/api-library';
import useApiQuery from '../../api/use-api-query';
import { Icons } from '../../components/icons';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Separator } from '../../components/ui/separator';
import { Skeleton } from '../../components/ui/skeleton';
import { Tabs } from '../../components/ui/tabs';
import { useUser } from '../../hooks/useUser';
import { cn } from '../../utils/cn';

export function WorkspaceBillingPage() {
  const [searchParams] = useSearchParams();
  const [loadingCustomerPortal, setLoadingCustomerPortal] = useState(false);

  const { data: subscriptionProducts } = useApiQuery({
    service: 'billing',
    method: 'getProducts',
    apiLibraryArgs: {},
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h3 className="text-lg font-medium">Billing</h3>
          <p className="text-sm text-muted-foreground">
            Manage your billing & payments.
          </p>
        </div>
        <div>
          <Button
            size="sm"
            loading={loadingCustomerPortal}
            variant={'link'}
            onClick={async () => {
              setLoadingCustomerPortal(true);

              const { data, error } = await api.billing.getCustomerPortal({
                config: {},
              });

              if (error || !data) {
                console.error(error ?? 'Error getting customer portal');
              } else {
                window.location.href = data.url;
              }

              setLoadingCustomerPortal(false);
            }}
            className="flex items-center space-x-2"
          >
            <span>Manage payment methods</span>
            <Icons.arrowRight />
          </Button>
        </div>
      </div>
      <Separator />
      <Tabs defaultValue={searchParams.get('tab') ?? 'subscription'}>
        <Tabs.Content
          value="subscription"
          className="flex flex-col space-y-6 max-h-full overflow-y-auto h-[calc(100dvh-180px)]"
        >
          {!subscriptionProducts ? (
            <div className="flex flex-col space-y-6">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
          ) : (
            <>
              <SubscriptionCard
                title={'Starter'}
                description={
                  '1 User. 1 Project. 60 Minute Polling Trigger. 250 credits a month. Execution History 3 days. Agent task history 3 days.'
                }
                price={`$0`}
                priceId={null}
              />
              {subscriptionProducts
                .filter((product) => product.price)
                .sort((a, b) => a.price!.unit_amount! - b.price!.unit_amount!)
                .map((product) => {
                  return (
                    <SubscriptionCard
                      key={product.id}
                      title={product.name}
                      description={product.description ?? ''}
                      price={`$${product.price!.unit_amount! / 100} /month`}
                      priceId={product.price!.id}
                    />
                  );
                })}
            </>
          )}
        </Tabs.Content>
        <Tabs.Content value="payments">Payments</Tabs.Content>
      </Tabs>
    </div>
  );
}

type SubscriptionCardType = {
  title: string;
  description: string;
  price: string;
  priceId: string | null;
};

const SubscriptionCard = ({
  title,
  description,
  price,
  priceId,
}: SubscriptionCardType) => {
  const { workspace } = useUser();
  const [loadingCheckoutSession, setLoadingCheckoutSession] = useState(false);

  const isCurrentPlan = useMemo(() => {
    const planType = workspace?.billing?.planType;

    if (!planType && title === 'Starter') {
      return true;
    }

    switch (planType) {
      case 'free':
        return 'Starter' === title;
      case 'team':
        return 'Team' === title;
      case 'professional':
        return 'Professional' === title;
      case 'business':
        return 'Business' === title;
      default:
        return false;
    }
  }, [title, workspace?.billing?.planType]);

  return (
    <Card
      className={cn({
        'bg-muted border-primary': isCurrentPlan,
        'hover:bg-muted/50': !isCurrentPlan,
      })}
    >
      <Card.Header>
        <Card.Title className="text-lg font-normal">{title}</Card.Title>
        <Card.Title className="text-2xl">{price}</Card.Title>
      </Card.Header>
      <Card.Content>
        <p className="text-sm text-muted-foreground">{description}</p>
      </Card.Content>
      <Card.Footer className="flex justify-end">
        {isCurrentPlan ? (
          <Button disabled>Selected</Button>
        ) : (
          <Button
            variant={'default'}
            loading={loadingCheckoutSession}
            onClick={async () => {
              setLoadingCheckoutSession(true);

              /**
               * If the user is on a paid plan, redirect them to the customer portal
               * If the user is on a free plan, we'll create a checkout session.
               *
               * The reason for this is because we only want a workspace to have one subscription at a time.
               * We don't want to allow a workspace to purchase multiple subscriptions.
               *
               * So if they already have a subscription, by redirecting them to the customer portal,
               * they can manage their subscription from there and Stripe will do the heavy lifting.
               *
               * The server will handle updating the subscription using webhooks
               */

              if (
                (workspace?.billing?.planType &&
                  workspace?.billing?.planType !== 'free') ||
                //!priceId is the free tier
                !priceId
              ) {
                //Has a paid plan, redirect to customer portal to manage subscription
                const { data, error } = await api.billing.getCustomerPortal({
                  config: {},
                });

                if (error || !data) {
                  console.error(error ?? 'Error getting customer portal');
                } else {
                  window.location.href = data.url;
                }
              } else {
                //Create a checkout session since there's no active subscription
                const { data, error } = await api.billing.createCheckoutSession(
                  {
                    priceId: priceId,
                    config: {},
                  },
                );

                if (error || !data) {
                  console.error(error ?? 'Error creating checkout session');
                } else {
                  window.location.href = data.url;
                }
              }

              setLoadingCheckoutSession(true);
            }}
          >
            {
              /* If the user is on a free plan, show "Select Plan" */
              workspace?.billing?.planType &&
              workspace.billing.planType !== 'free'
                ? 'Update Plan'
                : 'Select Plan'
            }
          </Button>
        )}
      </Card.Footer>
    </Card>
  );
};
