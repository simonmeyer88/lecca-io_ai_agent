import { useParams } from 'react-router-dom';

import useApiQuery from '../../api/use-api-query';
import PageLayout from '../../components/layouts/page-layout';
import { Loader } from '../../components/loaders/loader';

export default function ConnectionDetailsPage() {
  const { connectionId } = useParams();
  const { isLoading: isLoadingConnection, data: connection } = useApiQuery({
    service: 'connections',
    method: 'getById',
    apiLibraryArgs: { id: connectionId! },
  });

  if (isLoadingConnection) {
    return <Loader />;
  }

  if (!connection) {
    return null;
  }

  return (
    <PageLayout
      title={connection.name}
      breadcrumbs={[{ label: 'Connections', href: '/connections' }]}
    >
      <div className="flex h-full items-center justify-center">
        Eventually you will see data on how often this connection is used, and
        other details about the connection.
      </div>
    </PageLayout>
  );
}
