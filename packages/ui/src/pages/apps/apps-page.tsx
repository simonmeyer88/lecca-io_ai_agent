import { useState } from 'react';

import useApiQuery from '../../api/use-api-query';
import { CreateConnectionForm } from '../../components/forms/create-connection-form';
import PageLayout from '../../components/layouts/page-layout';
import { GridLoader } from '../../components/loaders/grid-loader';
import { Badge } from '../../components/ui/badge';
import { Card } from '../../components/ui/card';
import { Dialog } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Skeleton } from '../../components/ui/skeleton';

import { AppOverviewContent } from './components/app-overview-content';

export default function () {
  const [publishedSearch, setPublishedSearch] = useState('');
  const [showConnectionForm, setShowConnectionForm] = useState(false);
  const { data: workflowApps, isLoading: isLoadingWorkflowApps } = useApiQuery({
    service: 'workflowApps',
    method: 'getList',
    apiLibraryArgs: {},
  });

  const { data: connections } = useApiQuery({
    service: 'connections',
    method: 'getList',
    apiLibraryArgs: {},
  });

  return (
    <PageLayout
      title="Apps"
      subtitle="Browse and connect to your favorite apps."
    >
      {isLoadingWorkflowApps || !workflowApps ? (
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 pb-4">
            {workflowApps
              .filter(
                (app) =>
                  app.isPublished &&
                  (app.description
                    .toLocaleLowerCase()
                    .includes(publishedSearch.toLocaleLowerCase()) ||
                    app.name
                      .toLocaleLowerCase()
                      .includes(publishedSearch.toLocaleLowerCase())),
              )
              .map((app, index) => (
                <Dialog
                  key={app.id}
                  onOpenChange={(open) => {
                    if (!open) {
                      setTimeout(() => {
                        setShowConnectionForm(false);
                      }, 500);
                    }
                  }}
                >
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
                      {connections?.some(
                        (connection) => connection.workflowApp?.id === app.id,
                      ) && (
                        <Card.Footer>
                          <Badge variant="secondary">Connected</Badge>
                        </Card.Footer>
                      )}
                    </Card>
                  </Dialog.Trigger>
                  <Dialog.Content>
                    {showConnectionForm ? (
                      <CreateConnectionForm workflowApp={app} />
                    ) : (
                      <AppOverviewContent
                        app={app}
                        showConnectionForm={() => {
                          setShowConnectionForm(true);
                        }}
                      />
                    )}
                  </Dialog.Content>
                </Dialog>
              ))}
          </div>
        </div>
      )}
    </PageLayout>
  );
}
