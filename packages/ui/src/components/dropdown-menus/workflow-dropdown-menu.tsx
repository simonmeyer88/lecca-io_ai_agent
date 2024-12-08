import { useNavigate } from 'react-router-dom';

import useApiMutation from '@/api/use-api-mutation';
import { toast } from '@/hooks/useToast';

import { Icons } from '../icons';
import { Button } from '../ui/button';
import { DropdownMenu } from '../ui/dropdown-menu';

type WorkflowDropdownMenuProps = {
  projectId: string;
  workflowId: string;
};

export function WorkflowDropdownMenu(props: WorkflowDropdownMenuProps) {
  const navigate = useNavigate();

  const deleteWorkflowMutation = useApiMutation({
    service: 'workflows',
    method: 'delete',
  });

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <Button variant="outline" size="icon">
          <Icons.dotsHorizontal />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content onCloseAutoFocus={(e) => e.preventDefault()}>
        <DropdownMenu.Item
          onClick={(e) => {
            e.stopPropagation();
            navigate(
              `/projects/${props.projectId}/workflows/${props.workflowId}`,
            );
          }}
        >
          Open
        </DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Item
          onClick={(e) => {
            e.stopPropagation();
            deleteWorkflowMutation.mutate(
              {
                id: props.workflowId,
              },
              {
                onSuccess: () => {
                  toast({ title: 'Workflow deleted' });
                },
                onSettled: () => {
                  //   setIsSaving(false);
                },
              },
            );
          }}
          className="text-red-400"
        >
          Delete
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
}
