import 'reactflow/dist/style.css';

import { Execution as ExecutionModel } from '@/models/execution-model';
import { WorkflowTemplate as WorkflowTemplateModel } from '@/models/workflow-template-model';
import { Workflow as WorkflowModel } from '@/models/workflow/workflow-model';

import { Workflow } from './workflow';

export function WorkflowContainer({
  workflowData,
}: {
  workflowData?: WorkflowModel | ExecutionModel | WorkflowTemplateModel;
}) {
  return (
    <div className="flex h-[calc(100dvh-90px)] w-full space-x-6 border">
      <Workflow workflowData={workflowData} />
    </div>
  );
}
