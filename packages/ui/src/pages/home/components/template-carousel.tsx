import useApiQuery from '../../../api/use-api-query';
import { WorkflowTemplateCard } from '../../templates/workflow-templates-page';

export function TemplateCarousel() {
  const { data: apps } = useApiQuery({
    service: 'workflowApps',
    method: 'getList',
    apiLibraryArgs: {},
  });

  const { data: templates } = useApiQuery({
    service: 'workflowTemplates',
    method: 'getSharedList',
    apiLibraryArgs: {
      config: {
        sharedToType: 'global',
      },
    },
  });

  return (
    templates?.length &&
    apps && (
      <div className="flex max-w-full gap-6 overflow-x-auto overflow-y-hidden py-2">
        {templates.map((template) => (
          <WorkflowTemplateCard
            apps={apps}
            sharedToType="global"
            canShareToPublic={false}
            canShareToWorkspace={false}
            setRefetchTrigger={() => {
              //
            }}
            template={template}
            className="h-48 !min-w-[340px]"
          />
        ))}
      </div>
    )
  );
}
