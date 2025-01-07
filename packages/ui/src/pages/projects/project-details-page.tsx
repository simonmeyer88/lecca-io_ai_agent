import { Link, useParams } from 'react-router-dom';

import useApiQuery from '../../api/use-api-query';
import { InviteUserToProjectForm } from '../../components/forms/invite-user-to-project-form';
import { SelectProjectForAgentForm } from '../../components/forms/select-project-for-agent-form';
import { Icons } from '../../components/icons';
import PageLayout from '../../components/layouts/page-layout';
import { ListViewLoader } from '../../components/loaders/list-view-loader';
import { Loader } from '../../components/loaders/loader';
import { Avatar } from '../../components/ui/avatar';
import { Button } from '../../components/ui/button';
import { Dialog } from '../../components/ui/dialog';
import { ListView } from '../../components/ui/list-view';
import { Separator } from '../../components/ui/separator';
import { useUser } from '../../hooks/useUser';

import { NavProjectSelector } from './components/nav-selectors/nav-project-selector';
import { ProjectDetailsSectionRecentWorkflows } from './components/project-details-sections/project-details-section-active-workflows';
import { ProjectDetailsSectionRecentAgents } from './components/project-details-sections/project-details-section-agents';

export function ProjectDetailsPage() {
  const { enabledFeatures } = useUser();
  const { projectId } = useParams();
  const { data: project, isLoading: projectIsLoading } = useApiQuery({
    service: 'projects',
    method: 'getById',
    apiLibraryArgs: {
      id: projectId!,
    },
  });

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

  const { data: workflows, isLoading: isLoadingWorkflows } = useApiQuery({
    service: 'workflows',
    method: 'getList',
    apiLibraryArgs: {
      config: {
        params: {
          filterBy: [`projectId:${projectId}`],
        },
      },
    },
  });

  const { data: agents, isLoading: isLoadingAgents } = useApiQuery({
    service: 'agents',
    method: 'getList',
    apiLibraryArgs: {
      config: {
        params: {
          filterBy: [`projectId:${projectId}`],
        },
      },
    },
  });

  if (projectIsLoading || isLoadingWorkflows || isLoadingAgents) {
    return <Loader />;
  }

  if (!project) {
    return <div>Project not found</div>;
  }

  if (!agents?.length && !workflows?.length) {
    // return <div>Create Agent or Worfklow</div>;
  }

  return (
    <PageLayout
      title={project?.name}
      actions={[
        <div className="flex space-x-2 items-center">
          {!isLoadingProjectWorkspaceUsers && (
            <Dialog>
              <Dialog.Trigger>
                <Avatar.Group limit={3}>
                  <Avatar.GroupList>
                    {projectWorkspaceUsers!.map((user) => {
                      return (
                        <Avatar key={user.id}>
                          <Avatar.Image
                            src={user.profileImageUrl ?? undefined}
                            className="border-4 border-accent cursor-pointer"
                          />
                          <Avatar.Fallback className="border cursor-pointer">
                            {user.user?.name[0]}
                          </Avatar.Fallback>
                        </Avatar>
                      );
                    })}
                  </Avatar.GroupList>
                  <Avatar.OverflowIndicator className="border" />
                </Avatar.Group>
              </Dialog.Trigger>
              <Dialog.Content className="p-6">
                <ListView className="w-full overflow-y-auto max-h-[80vh]">
                  {isLoadingProjectWorkspaceUsers || !projectWorkspaceUsers ? (
                    <ListViewLoader />
                  ) : (
                    <>
                      <ListView.Title className="mb-4">
                        Project Users
                      </ListView.Title>
                      <ListView.Body>
                        {projectWorkspaceUsers.map((workspaceUser) => (
                          <ListView.Row
                            key={workspaceUser.id}
                            className="flex justify-between"
                          >
                            <div className="flex space-x-5 items-center">
                              <Avatar>
                                <Avatar.Image
                                  src={
                                    workspaceUser.profileImageUrl ?? undefined
                                  }
                                />
                                <Avatar.Fallback>
                                  {workspaceUser.user?.name[0]}
                                </Avatar.Fallback>
                              </Avatar>
                              <div className="">
                                <ListView.Title>
                                  {workspaceUser.user!.name}
                                </ListView.Title>
                                <ListView.Description>
                                  {workspaceUser.user!.email}
                                </ListView.Description>
                              </div>
                            </div>
                          </ListView.Row>
                        ))}
                      </ListView.Body>
                    </>
                  )}
                </ListView>{' '}
              </Dialog.Content>
            </Dialog>
          )}
          <Dialog>
            <Dialog.Trigger asChild>
              <Button variant={'outline'} className="space-x-2">
                <Icons.plusUser className="w-4 h-4" />
                <span>Invite</span>
              </Button>
            </Dialog.Trigger>
            <Dialog.Content>
              <InviteUserToProjectForm projectId={projectId!} />
            </Dialog.Content>
          </Dialog>
        </div>,
        !enabledFeatures.WORKFLOWS ? null : (
          <Button variant={'outline'} asChild>
            <Link
              to={`/projects/${projectId}/workflows/new`}
              className="space-x-2"
            >
              <span>Workflow</span>
              <Icons.plus />
            </Link>
          </Button>
        ),
        !enabledFeatures.AGENTS ? null : (
          <Dialog>
            <Dialog.Trigger asChild>
              <Button variant={'outline'} className="space-x-2">
                <span>Agent</span>
                <Icons.plus />
              </Button>
            </Dialog.Trigger>
            <Dialog.Content>
              <SelectProjectForAgentForm />
            </Dialog.Content>
          </Dialog>
        ),
        <Button size="icon" variant="outline" asChild>
          <Link to={`/projects/${projectId}/settings`}>
            <Icons.gear />
          </Link>
        </Button>,
      ].filter(Boolean)}
      breadcrumbs={[{ label: 'Projects', href: '/projects' }]}
      titleButton={<NavProjectSelector />}
      className="space-y-8 pb-8"
    >
      {enabledFeatures.AGENTS && (
        <>
          <ProjectDetailsSectionRecentAgents projectId={projectId!} />
          <Separator />
        </>
      )}
      {enabledFeatures.WORKFLOWS && (
        <ProjectDetailsSectionRecentWorkflows projectId={projectId!} />
      )}
    </PageLayout>
  );
}
