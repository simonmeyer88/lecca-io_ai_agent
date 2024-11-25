import { useNavigate } from 'react-router-dom';

import useApiMutation from '@/api/use-api-mutation';
import { toast } from '@/hooks/useToast';

import { Icons } from '../icons';
import { Button } from '../ui/button';
import { DropdownMenu } from '../ui/dropdown-menu';

type AgentDropdownMenuProps = {
  projectId: string;
  agentId: string;
};

export function AgentDropdownMenu(props: AgentDropdownMenuProps) {
  const navigate = useNavigate();

  const deleteAgentMutation = useApiMutation({
    service: 'agents',
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
              `/redirect?redirect=/projects/${props.projectId}/agents/${props.agentId}`,
            );
          }}
        >
          Open
        </DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Item
          onClick={(e) => {
            e.stopPropagation();
            deleteAgentMutation.mutate(
              {
                id: props.agentId,
              },
              {
                onSuccess: () => {
                  toast({ title: 'Agent deleted' });
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
