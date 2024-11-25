import { WorkflowApp } from '@/models/workflow/workflow-app-model';

type CreateEditAppTriggerFormProps = {
  app: WorkflowApp;
};

export function CreateEditAppTriggerForm(props: CreateEditAppTriggerFormProps) {
  return (
    <div className="flex w-[5000px]">
      {props.app.name}
      <div className="flex-1 flex items-center justify-center">
        Form builder here
      </div>
      <div className="flex-1 flex items-center justify-center">
        Form Preview here
      </div>
    </div>
  );
}
