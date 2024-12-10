import {
  CaretSortIcon,
  CheckIcon,
  PlusCircledIcon,
} from '@radix-ui/react-icons';
import React from 'react';
import { useNavigate } from 'react-router-dom';

import useApiMutation from '../../api/use-api-mutation';
import useApiQuery from '../../api/use-api-query';
import { useUser } from '../../hooks/useUser';
import { Workspace } from '../../models/workspace-model';
import { cn } from '../../utils/cn';
import { CreateWorkspaceForm } from '../forms/create-workspace-form';
import { Avatar } from '../ui/avatar';
import { Button } from '../ui/button';
import { Command } from '../ui/command';
import { Dialog } from '../ui/dialog';
import { Popover } from '../ui/popover';
import { ScrollArea } from '../ui/scroll-area';

export default function WorkspaceSelector({
  className,
  isCollapsed,
}: {
  className?: string;
  isCollapsed?: boolean;
}) {
  const navigate = useNavigate();
  const { workspace, initializeUserContextData } = useUser();

  const { data: workspaces, isLoading } = useApiQuery({
    service: 'workspaces',
    method: 'getList',
    apiLibraryArgs: {},
  });

  const [open, setOpen] = React.useState(false);
  const [showNewWorkspaceDialog, setShowNewWorkspaceDialog] =
    React.useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = React.useState<Workspace>(
    workspace!,
  );

  const setActiveWorkspaceMutation = useApiMutation({
    service: 'workspaces',
    method: 'setActiveWorkspace',
  });

  if (isLoading || !workspaces) {
    return null;
  }

  return (
    <Dialog
      open={showNewWorkspaceDialog}
      onOpenChange={setShowNewWorkspaceDialog}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-label="Select a location"
            className={cn('justify-between w-full', className, {
              'px-2': !isCollapsed,
              'border-none': isCollapsed,
              'px-0': isCollapsed,
              flex: isCollapsed,
              'justify-center': isCollapsed,
            })}
          >
            {isCollapsed ? (
              <Avatar className="size-7 rounded-full border relative">
                <Avatar.Image src={workspace?.logoUrl} />
                <Avatar.Fallback className="text-sm">
                  {selectedWorkspace.name?.[0]}
                </Avatar.Fallback>
              </Avatar>
            ) : (
              <>
                <Avatar className="size-6 rounded-full border relative mr-2">
                  <Avatar.Image src={workspace?.logoUrl} />
                  <Avatar.Fallback className="text-sm">
                    {selectedWorkspace.name?.[0]}
                  </Avatar.Fallback>
                </Avatar>
                <span className="truncate mr-1">{selectedWorkspace.name}</span>
                <CaretSortIcon className="ml-auto h-4 w-4 shrink-0 opacity-50" />
              </>
            )}
          </Button>
        </Popover.Trigger>
        <Popover.Content className="w-[250px] p-0">
          <Command>
            <Command.List>
              {workspaces.length > 5 && <Command.Input placeholder="Search" />}
              <Command.Empty>No workspace found.</Command.Empty>
              <Command.Group key={'workspaces'} heading={'Workspaces'}>
                <ScrollArea
                  className={cn({
                    'h-72': workspaces && workspaces.length > 10,
                  })}
                >
                  {workspaces.map((workspace) => (
                    <Command.Item
                      key={workspace.id}
                      onSelect={async () => {
                        if (workspace.id === selectedWorkspace.id) {
                          setOpen(false);
                          navigate('/workspace-settings');
                          return;
                        } else {
                          setSelectedWorkspace(workspace);
                          await setActiveWorkspaceMutation.mutateAsync({
                            workspaceId: workspace.id,
                          });
                          setOpen(false);
                          await initializeUserContextData();
                          navigate('/', { replace: true });
                        }
                      }}
                      className="text-sm"
                    >
                      <Avatar className="size-6 rounded-full border relative mr-2">
                        <Avatar.Image src={workspace?.logoUrl} />
                        <Avatar.Fallback className="text-sm">
                          {workspace.name?.[0]}
                        </Avatar.Fallback>
                      </Avatar>
                      <span>{workspace.name}</span>
                      <CheckIcon
                        className={cn(
                          'ml-auto h-4 w-4',
                          selectedWorkspace.id === workspace.id
                            ? 'opacity-100'
                            : 'opacity-0',
                        )}
                      />
                    </Command.Item>
                  ))}
                </ScrollArea>
              </Command.Group>
            </Command.List>
            <Command.Separator />
            <Command.List>
              <Command.Group>
                <Dialog.Trigger asChild>
                  <Command.Item
                    onSelect={() => {
                      setOpen(false);
                      setShowNewWorkspaceDialog(true);
                    }}
                  >
                    <PlusCircledIcon className="mr-2 h-5 w-5" />
                    New Workspace
                  </Command.Item>
                </Dialog.Trigger>
              </Command.Group>
            </Command.List>
          </Command>
        </Popover.Content>
      </Popover>
      <Dialog.Content>
        <CreateWorkspaceForm
          closeDialog={() => setShowNewWorkspaceDialog(false)}
        />
      </Dialog.Content>
    </Dialog>
  );
}
