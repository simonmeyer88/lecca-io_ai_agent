import { useState } from 'react';

import useApiQuery from '@/api/use-api-query';
import { GridLoader } from '@/components/loaders/grid-loader';
import { Card } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

import { AppOverviewContent } from '../apps/components/app-overview-content';

export function PublicAppsPage() {
  const [publishedSearch, setPublishedSearch] = useState('');
  const { data: workflowApps, isLoading: isLoadingWorkflowApps } = useApiQuery({
    service: 'workflowApps',
    method: 'getList',
    apiLibraryArgs: {},
  });

  return isLoadingWorkflowApps || !workflowApps ? (
    <div className="space-y-6">
      <Skeleton className="h-12 w-[200px] lg:w-[250px]" />
      <GridLoader itemClassName="h-40" />
    </div>
  ) : (
    <div className="space-y-6">
      <Input
        type="search"
        placeholder="Search apps..."
        className="py-2 w-[200px] lg:w-[250px] ml-1"
        value={publishedSearch}
        onChange={(e) => {
          setPublishedSearch(e.target.value);
        }}
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {workflowApps
          .filter(
            (app) =>
              (app.isPublished &&
                app.description
                  .toLocaleLowerCase()
                  .includes(publishedSearch.toLocaleLowerCase())) ||
              app.name
                .toLocaleLowerCase()
                .includes(publishedSearch.toLocaleLowerCase()),
          )
          .map((app, index) => (
            <Dialog key={app.id}>
              <Dialog.Trigger asChild>
                <Card key={app.id + index}>
                  <Card.Header className="relative">
                    <Card.Title className="flex items-center space-x-3">
                      <img
                        src={app.logoUrl}
                        alt={app.name}
                        className="w-7 h-7 bg-white p-0.5 rounded"
                      />
                      <span>{app.name}</span>
                    </Card.Title>
                    <Card.Description>{app.description}</Card.Description>
                  </Card.Header>
                </Card>
              </Dialog.Trigger>
              <Dialog.Content>
                <AppOverviewContent app={app} />
              </Dialog.Content>
            </Dialog>
          ))}
      </div>
    </div>
  );
}
