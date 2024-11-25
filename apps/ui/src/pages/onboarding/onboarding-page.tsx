import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

import useApiMutation from '@/api/use-api-mutation';
import useApiQuery from '@/api/use-api-query';
import { CreateConnectionForm } from '@/components/forms/create-connection-form';
import { CreateProjectForm } from '@/components/forms/create-project-form';
import { JoinWorkspaceForm } from '@/components/forms/join-workspace-form';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Carousel, CarouselApi } from '@/components/ui/carousel';
import { Dialog } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useUser } from '@/hooks/useUser';
import { WorkspaceInvitation } from '@/models/workspace-invitation-model';

export function OnboardingPage() {
  const { data: workspaceInvitations, isLoading: isLoadingInvitations } =
    useApiQuery({
      service: 'workspaceInvitations',
      method: 'getMe',
      apiLibraryArgs: {},
    });
  const [carouselApi, setCarouselApi] = React.useState<CarouselApi>();

  if (isLoadingInvitations || !workspaceInvitations) {
    return (
      <Card className="w-full max-w-2xl border-none space-y-6 p-6">
        <div className="space-y-2">
          <Skeleton className="w-32 h-6" />
          <Skeleton className="w-64 h-6" />
        </div>
        <div className="space-y-6">
          <Skeleton className="w-full h-28" />
          <Skeleton className="w-full h-28" />
          <Skeleton className="w-full h-28" />
        </div>
        <div className="flex justify-end">
          <Skeleton className="w-24 h-10" />
        </div>
      </Card>
    );
  }

  return (
    <Carousel
      setApi={setCarouselApi}
      opts={{ duration: 10, watchDrag: false, watchSlides: false }}
      className="max-w-2xl"
    >
      <Carousel.Content>
        {workspaceInvitations.length !== 0 && (
          <Carousel.Item>
            <ViewWorkspaceInvitations
              invitations={workspaceInvitations!}
              nextStep={() => carouselApi?.scrollNext()}
            />
          </Carousel.Item>
        )}
        <Carousel.Item>
          <SetupWorkspaceStep nextStep={() => carouselApi?.scrollNext()} />
        </Carousel.Item>
        <Carousel.Item>
          <CreateWorkflowStep previousStep={() => carouselApi?.scrollPrev()} />
        </Carousel.Item>
      </Carousel.Content>
    </Carousel>
  );
}

function ViewWorkspaceInvitations({
  invitations,
  nextStep,
}: {
  invitations: WorkspaceInvitation[];
  nextStep: () => void;
}) {
  return (
    <Card className="border-none bg-background">
      <Card.Header>
        <Card.Title>
          You`ve been invited to the following{' '}
          {invitations.length === 1 ? 'Workspace' : 'Workspaces'}
        </Card.Title>
        <Card.Description>
          Select {invitations.length === 1 ? 'the' : 'a'} workspace below to
          accept or decline the invitation.
        </Card.Description>
      </Card.Header>
      <ScrollArea>
        <Card.Content className="space-y-4 max-h-96">
          {invitations.map((invitation) => (
            <OnboardingTile
              key={invitation.id}
              title={invitation.workspace.name}
              Icon={Icons.plusUser}
              DialogContent={<JoinWorkspaceForm invitation={invitation} />}
              description={`Join ${invitation.workspace.name} to collaborate on projects and access shared resources.`}
              markAsClicked={false}
            />
          ))}
        </Card.Content>
      </ScrollArea>
      <Card.Footer className="flex justify-end space-x-2 mt-6">
        <Button
          variant={'expandIcon'}
          Icon={Icons.arrowRight}
          iconPlacement="right"
          onClick={nextStep}
        >
          Skip
        </Button>
      </Card.Footer>
    </Card>
  );
}

function SetupWorkspaceStep({ nextStep }: { nextStep: () => void }) {
  const { workspaceUser, workspace, setWorkspace } = useUser();
  const [loading, setLoading] = React.useState(false);
  const navigate = useNavigate();
  const onboardMutation = useApiMutation({
    service: 'workspaces',
    method: 'updateMe',
    apiLibraryArgs: {},
  });

  return (
    <Card className="border-none bg-background">
      <Card.Header>
        <Card.Title className="leading-0 text-lg md:text-xl">
          {workspaceUser?.user?.name},
          <br />
          Welcome to Lecca.io
        </Card.Title>
        <Card.Description className="">
          Before you start automating, let's get your workspace setup.
        </Card.Description>
      </Card.Header>
      <Card.Content className="space-y-4">
        {/* <OnboardingTile
          title="Invite Team Members"
          Icon={Icons.users}
          description="Invite your team members to collaborate on workflows."
          DialogContent={<InviteUsertoWorkspaceForm />}
        /> */}
        <OnboardingTile
          title="Connect Apps"
          Icon={Icons.app}
          description="Connect to your favorite apps to use them in your automations."
          DialogContent={<CreateConnectionForm />}
        />
      </Card.Content>
      <Card.Footer className="flex justify-end space-x-2">
        <Button
          variant={'outline'}
          loading={loading}
          onClick={async () => {
            setLoading(true);
            await onboardMutation.mutateAsync(
              {
                data: {
                  onboarded: true,
                },
              },
              {
                onSuccess: () => {
                  workspace!.onboarded = true;
                  setWorkspace(workspace!);
                  navigate('/');
                },
                onSettled: () => {
                  setLoading(false);
                },
              },
            );
          }}
        >
          Skip Onboarding
        </Button>
        <Button
          variant={'expandIcon'}
          Icon={Icons.arrowRight}
          iconPlacement="right"
          onClick={nextStep}
        >
          Next
        </Button>
      </Card.Footer>
    </Card>
  );
}

function CreateWorkflowStep({ previousStep }: { previousStep: () => void }) {
  const { workspace, setWorkspace } = useUser();
  const [loading, setLoading] = React.useState(false);
  const navigate = useNavigate();
  const onboardMutation = useApiMutation({
    service: 'workspaces',
    method: 'updateMe',
    apiLibraryArgs: {},
  });

  return (
    <Card className="border-none bg-background">
      <Card.Header>
        <Card.Title className="leading-0 text-lg md:text-xl">
          Build your first automation
        </Card.Title>
        <Card.Description>
          <strong>Workflows</strong> and <strong>Agents</strong> are automation
          tools you can use within projects.
        </Card.Description>
        <Card.Description>
          You'll be asked to create a project first.
        </Card.Description>
        <Card.Description>
          Projects allow you to control user access to your workflows, agents,
          connections to apps, knowledge notebooks, and define custom variables.
        </Card.Description>
        <Card.Description>
          As your team grows, leveraging projects will help you keep your
          automation tools organized.
        </Card.Description>
        <br />
        <Card.Description>
          <Link
            to="https://docs.lecca.io"
            target="_blank"
            className="flex items-center space-x-2 hover:underline"
          >
            <Icons.infoCircle className="size-4" />
            <span>Go to our docs to learn more.</span>
          </Link>
        </Card.Description>
      </Card.Header>
      <Card.Content className="space-y-4">
        <OnboardingTile
          title="Create Workflow"
          Icon={Icons.workflow}
          description="You'll be asked to create a project first."
          onClick={() => {
            onboardMutation.mutateAsync(
              {
                data: {
                  onboarded: true,
                },
              },
              {
                onSuccess: () => {
                  workspace!.onboarded = true;
                  setWorkspace(workspace!);
                },
              },
            );
          }}
          DialogContent={
            <CreateProjectForm redirectRelativeToProjectIdPath="/workflows/new" />
          }
        />
        <OnboardingTile
          title="Create Agent"
          Icon={Icons.agent}
          description="You'll be asked to create a project first."
          onClick={() => {
            onboardMutation.mutateAsync(
              {
                data: {
                  onboarded: true,
                },
              },
              {
                onSuccess: () => {
                  workspace!.onboarded = true;
                  setWorkspace(workspace!);
                },
              },
            );
          }}
          DialogContent={<CreateProjectForm />}
        />
      </Card.Content>
      <Card.Footer className="flex justify-between space-x-2">
        <div>
          <Button
            variant={'expandIconOutline'}
            Icon={Icons.arrowLeft}
            iconPlacement="left"
            onClick={previousStep}
          >
            Previous
          </Button>
        </div>
        <div className="flex space-x-2">
          <Button
            variant={'expandIcon'}
            Icon={Icons.check}
            iconPlacement="right"
            loading={loading}
            onClick={async () => {
              setLoading(true);
              await onboardMutation.mutateAsync(
                {
                  data: {
                    onboarded: true,
                  },
                },
                {
                  onSuccess: () => {
                    workspace!.onboarded = true;
                    setWorkspace(workspace!);
                    navigate('/');
                  },
                  onSettled: () => {
                    setLoading(false);
                  },
                },
              );
            }}
          >
            Done
          </Button>
        </div>
      </Card.Footer>
    </Card>
  );
}

type OnboardingTileProps = {
  title: string;
  description: string;

  Icon: React.ComponentType<any>;
  DialogContent: React.ReactNode;
  onClick?: () => void;
  markAsClicked?: boolean;
};

function OnboardingTile(props: OnboardingTileProps) {
  const [clicked, setClicked] = React.useState(false);

  return (
    <Dialog>
      <Dialog.Trigger asChild>
        <Card
          onClick={() => {
            props.onClick?.();
            setTimeout(() => {
              //So it updates while the dialog is open
              setClicked(true);
            }, 500);
          }}
        >
          <Card.Header className="flex flex-row items-center justify-between space-x-4">
            <div className="flex flex-row space-x-4 items-center">
              <props.Icon className="text-muted-foreground size-5" />
              <div className="flex flex-col space-y-1">
                <Card.Title>{props.title}</Card.Title>
                <Card.Description>{props.description}</Card.Description>
              </div>
            </div>
            {clicked && props.markAsClicked !== false ? (
              <Icons.check className="text-status-good size-5" />
            ) : (
              <Icons.chevronRight className="group-hover:animate-pulse group-hover:translate-x-1 transition-transform" />
            )}
          </Card.Header>
        </Card>
      </Dialog.Trigger>
      <Dialog.Content>{props.DialogContent}</Dialog.Content>
    </Dialog>
  );
}
