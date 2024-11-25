import { useParams } from 'react-router-dom';

import useApiQuery from '@/api/use-api-query';
import { ListViewLoader } from '@/components/loaders/list-view-loader';
import { Avatar } from '@/components/ui/avatar';
import { ListView } from '@/components/ui/list-view';
import { Separator } from '@/components/ui/separator';

export function ProjectWorkspaceUsersPage() {
  const { projectId } = useParams();

  const {
    data: projectWorkspaceUsers,
    isLoading: isLoadingProjectWorkspaceUsers,
  } = useApiQuery({
    service: 'workspaceUsers',
    method: 'getList',
    apiLibraryArgs: {
      config: {
        params: {
          filterBy: [`projectId:${projectId}`],
        },
      },
    },
  });

  return (
    <div className="space-y-6 w-full h-full">
      <div className="flex justify-between">
        <div>
          <h3 className="text-lg font-medium">Project Users</h3>
          <p className="text-sm text-muted-foreground">
            User's collaberating on this project
          </p>
        </div>
      </div>
      <Separator />
      <ListView className="w-full overflow-y-auto h-[calc(100dvh-275px)]">
        {isLoadingProjectWorkspaceUsers || !projectWorkspaceUsers ? (
          <ListViewLoader />
        ) : (
          <ListView.Body>
            {projectWorkspaceUsers.map((workspaceUser) => (
              <ListView.Row
                key={workspaceUser.id}
                className="flex justify-between"
              >
                <div className="flex space-x-5 items-center">
                  <Avatar>
                    <Avatar.Image
                      src={workspaceUser.profileImageUrl ?? undefined}
                    />
                    <Avatar.Fallback>
                      {workspaceUser.user?.name[0]}
                    </Avatar.Fallback>
                  </Avatar>
                  <div className="">
                    <ListView.Title>{workspaceUser.user!.name}</ListView.Title>
                    <ListView.Description>
                      {workspaceUser.user!.email}
                    </ListView.Description>
                  </div>
                </div>
              </ListView.Row>
            ))}
          </ListView.Body>
        )}
      </ListView>
    </div>
  );
}
