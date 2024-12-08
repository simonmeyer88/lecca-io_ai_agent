import React from 'react';

import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

type HomeSummaryCardProps = {
  title: string;
  value: React.ReactNode;

  Icon: React.ComponentType<any>;
  summary: React.ReactNode;
  isLoading: boolean;
};

export function HomeSummaryCard(props: HomeSummaryCardProps) {
  return (
    <Card>
      <Card.Header className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4">
        <Card.Title className="text-sm font-medium">{props.title}</Card.Title>
        <props.Icon className="size-4 text-muted-foreground" />
      </Card.Header>
      {props.isLoading ? (
        <Card.Content className="relative mt-4">
          <Skeleton className="w-1/4 h-3" />
          <Skeleton className="w-1/2 h-3 mt-2" />
        </Card.Content>
      ) : (
        <Card.Content className="pb-4">
          <div className="text-2xl font-bold">{props.value}</div>
          {props.summary}
        </Card.Content>
      )}
    </Card>
  );
}
