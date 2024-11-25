import PageLayout from '@/components/layouts/page-layout';

import ExecutionsTable from './components/table/executions-table';

export default function ExecutionsPage() {
  return (
    <PageLayout
      title="Executions"
      subtitle="Track and manage your workflow executions."
    >
      <ExecutionsTable />
    </PageLayout>
  );
}
