import PageLayout from '../../components/layouts/page-layout';

import ExecutionsTable from './components/table/credits-table';

export default function CreditsPage() {
  return (
    <PageLayout
      title="Credit Usage"
      subtitle="Track and manage your credit usage."
    >
      <ExecutionsTable />
    </PageLayout>
  );
}
