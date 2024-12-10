import PageLayout from '../../components/layouts/page-layout';

import TasksTableWithData from './components/table/tasks-table';

export default function TasksPage() {
  return (
    <PageLayout
      title="Conversations"
      subtitle="Manage the converations with your AI Agents"
    >
      <TasksTableWithData />
    </PageLayout>
  );
}
