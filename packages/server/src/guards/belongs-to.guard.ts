import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { WorkspaceUserRole } from '@prisma/client';

import { WorkspaceInvitationsService } from '@/modules/commercial/workspace-invitations/workspace-invitations.service';
import { AgentsService } from '@/modules/core/agents/agents.service';
import { ConnectionsService } from '@/modules/core/connections/connections.service';
import { ExecutionsService } from '@/modules/core/executions/executions.service';
import { KnowledgeService } from '@/modules/core/knowledge/knowledge.service';
import { ProjectInvitationsService } from '@/modules/core/project-invitations/project-invitations.service';
import { ProjectsService } from '@/modules/core/projects/projects.service';
import { TasksService } from '@/modules/core/tasks/tasks.service';
import { UsersService } from '@/modules/core/users/users.service';
import { VariablesService } from '@/modules/core/variables/variables.service';
import { WorkflowAppsService } from '@/modules/core/workflow-apps/workflow-apps.service';
import { WorkflowTemplatesService } from '@/modules/core/workflow-templates/workflow-templates.service';
import { WorkflowsService } from '@/modules/core/workflows/workflows.service';
import { WorkspaceUsersService } from '@/modules/core/workspace-users/workspace-users.service';
import { CreditsService } from '@/modules/global/credits/credits.service';
import { NotificationsService } from '@/modules/global/notifications/notifications.service';
import { JwtUser } from '@/types/jwt-user.type';

import { BelongsTo } from '../decorators/belongs-to.decorator';

/**
 * This guard checks if the user or workspace owns the resource they are trying to access.
 */

@Injectable()
export class BelongsToGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private workspaceUsers: WorkspaceUsersService,
    private users: UsersService,
    private workspaceInvitations: WorkspaceInvitationsService,
    private notifications: NotificationsService,
    private projects: ProjectsService,
    private workflows: WorkflowsService,
    private workflowTemplates: WorkflowTemplatesService,
    private agents: AgentsService,
    private tasks: TasksService,
    private workflowApps: WorkflowAppsService,
    private variables: VariablesService,
    private connections: ConnectionsService,
    private projectInvitations: ProjectInvitationsService,
    private executions: ExecutionsService,
    private knowledge: KnowledgeService,
    private credits: CreditsService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const belongsToOptions = this.reflector.get(
      BelongsTo,
      context.getHandler(),
    );

    if (!belongsToOptions) {
      //If the @BelongsTo() decorator is not used, then this guard will not be applied
      return true;
    }

    const request = context.switchToHttp().getRequest();

    if (!request.params[belongsToOptions.key]) {
      return true;
    }
    if (belongsToOptions.owner === 'me') {
      if (
        await checkOwnerIsMe(
          request.user,
          request.params,
          belongsToOptions.key,
          {
            workspaceInvitations: this.workspaceInvitations,
            notifications: this.notifications,
            projects: this.projects,
            workflows: this.workflows,
            workflowTemplates: this.workflowTemplates,
            agents: this.agents,
            tasks: this.tasks,
            variables: this.variables,
            projectInvitations: this.projectInvitations,
            connections: this.connections,
            executions: this.executions,
            knowledge: this.knowledge,
            credits: this.credits,
          },
        )
      ) {
        return true;
      }
    } else if (belongsToOptions.owner === 'workspace') {
      if (
        await checkOwnerIsWorkspace(
          request.user,
          request.params,
          belongsToOptions.key,
          belongsToOptions.roles,
          {
            workspaceUsers: this.workspaceUsers,
            users: this.users,
            workspaceInvitations: this.workspaceInvitations,
            projects: this.projects,
            workflows: this.workflows,
            workflowTemplates: this.workflowTemplates,
            agents: this.agents,
            tasks: this.tasks,
            workflowApps: this.workflowApps,
            variables: this.variables,
            projectInvitations: this.projectInvitations,
            connections: this.connections,
            executions: this.executions,
            knowledge: this.knowledge,
            credits: this.credits,
          },
        )
      ) {
        return true;
      }
    } else if (belongsToOptions.owner === 'either') {
      if (
        (await checkOwnerIsMe(
          request.user,
          request.params,
          belongsToOptions.key,
          {
            workspaceInvitations: this.workspaceInvitations,
            notifications: this.notifications,
            projects: this.projects,
            workflows: this.workflows,
            workflowTemplates: this.workflowTemplates,
            agents: this.agents,
            tasks: this.tasks,
            variables: this.variables,
            projectInvitations: this.projectInvitations,
            connections: this.connections,
            executions: this.executions,
            knowledge: this.knowledge,
            credits: this.credits,
          },
        )) ||
        (await checkOwnerIsWorkspace(
          request.user,
          request.params,
          belongsToOptions.key,
          belongsToOptions.roles,
          {
            workspaceUsers: this.workspaceUsers,
            users: this.users,
            workspaceInvitations: this.workspaceInvitations,
            projects: this.projects,
            workflows: this.workflows,
            workflowTemplates: this.workflowTemplates,
            agents: this.agents,
            tasks: this.tasks,
            workflowApps: this.workflowApps,
            variables: this.variables,
            projectInvitations: this.projectInvitations,
            connections: this.connections,
            executions: this.executions,
            knowledge: this.knowledge,
            credits: this.credits,
          },
        ))
      ) {
        return true;
      }
    }

    throw new ForbiddenException(
      'You do not have permission to access this resource.',
    );
  }
}

const checkOwnerIsMe = async (
  user: JwtUser,
  param: Record<string, any>,
  key: string,
  services: {
    workspaceInvitations: WorkspaceInvitationsService;
    notifications: NotificationsService;
    projects: ProjectsService;
    workflows: WorkflowsService;
    workflowTemplates: WorkflowTemplatesService;
    agents: AgentsService;
    tasks: TasksService;
    variables: VariablesService;
    projectInvitations: ProjectInvitationsService;
    connections: ConnectionsService;
    executions: ExecutionsService;
    knowledge: KnowledgeService;
    credits: CreditsService;
  },
) => {
  switch (key) {
    case 'userId':
      return user.userId === param[key];
    case 'workspaceUserId':
      return user.workspaceUserId === param[key];
    case 'workspaceId':
      return user.workspaceId === param[key];
    case 'workspaceInvitationId':
      return await services.workspaceInvitations.checkWorkspaceInvitationBelongsToUserEmail(
        {
          workspaceInvitationId: param[key],
          email: user.email,
        },
      );
    case 'notificationId':
      return await services.notifications.checkNotificationBelongsToWorkspaceUser(
        {
          notificationId: param[key],
          workspaceUserId: user.workspaceUserId,
        },
      );
    case 'projectId':
      return await services.projects.checkWorkspaceUserHasAccessToProject({
        workspaceUserId: user.workspaceUserId,
        projectId: param[key],
      });
    case 'workflowId':
      return await services.workflows.checkWorkspaceUserHasAccessToWorkflow({
        workspaceUserId: user.workspaceUserId,
        workflowId: param[key],
      });
    case 'workflowTemplateId':
      return await services.workflowTemplates.checkWorkspaceUserHasEditingPermmissionsForWorkflowTemplate(
        {
          workspaceUserId: user.workspaceUserId,
          workflowTemplateId: param[key],
        },
      );
    case 'agentId':
      return await services.agents.checkWorkspaceUserHasAccessToAgent({
        workspaceUserId: user.workspaceUserId,
        agentId: param[key],
      });
    case 'taskId':
      return await services.tasks.checkWorkspaceUserHasAccessToTask({
        workspaceUserId: user.workspaceUserId,
        taskId: param[key],
      });
    case 'variableId':
      return await services.variables.checkVariableBelongsToWorkspaceUser({
        workspaceId: user.workspaceId,
        workspaceUserId: user.workspaceUserId,
        variableId: param[key],
      });
    case 'knowledgeId':
      return await services.knowledge.checkKnowledgeBelongsToWorkspaceUser({
        workspaceId: user.workspaceId,
        workspaceUserId: user.workspaceUserId,
        knowledgeId: param[key],
      });
    case 'vectorRefId':
      return await services.knowledge.checkKnowledgeVectorRefBelongsToWorkspaceUser(
        {
          workspaceId: user.workspaceId,
          workspaceUserId: user.workspaceUserId,
          vectorRefId: param[key],
        },
      );
    case 'connectionId':
      return await services.connections.checkConnectionBelongsToWorkspaceUser({
        workspaceId: user.workspaceId,
        workspaceUserId: user.workspaceUserId,
        connectionId: param[key],
      });
    case 'projectInvitationId':
      return await services.projectInvitations.checkProjectInvitationBelongsToWorkspaceUser(
        {
          invitationId: param[key],
          workspaceUserId: user.workspaceUserId,
        },
      );
    case 'executionId':
      return await services.executions.checkExecutionBelongsToWorkspaceUser({
        executionId: param[key],
        workspaceUserId: user.workspaceUserId,
      });
    case 'creditId':
      return await services.credits.checkCreditBelongsToWorkspaceUser({
        creditId: param[key],
        workspaceUserId: user.workspaceUserId,
      });
    default:
      throw new InternalServerErrorException(
        'BelongsTo decorator key is not supported: ' + key,
      );
  }
};

const checkOwnerIsWorkspace = async (
  user: JwtUser,
  param: Record<string, any>,
  key: string,
  roles: WorkspaceUserRole[],
  services: {
    workspaceUsers: WorkspaceUsersService;
    users: UsersService;
    workspaceInvitations: WorkspaceInvitationsService;
    projects: ProjectsService;
    workflows: WorkflowsService;
    workflowTemplates: WorkflowTemplatesService;
    agents: AgentsService;
    tasks: TasksService;
    workflowApps: WorkflowAppsService;
    variables: VariablesService;
    connections: ConnectionsService;
    projectInvitations: ProjectInvitationsService;
    executions: ExecutionsService;
    knowledge: KnowledgeService;
    credits: CreditsService;
  },
) => {
  if (!matchRoles(roles, user.roles)) {
    return false;
  }

  switch (key) {
    case 'workspaceId':
      return await services.users.checkUserBelongsToWorkspace({
        workspaceId: param[key],
        userId: user.userId,
      });
    case 'workspaceUserId':
      return await services.workspaceUsers.checkWorkspaceUserBelongsToWorkspace(
        {
          workspaceId: user.workspaceId,
          workspaceUserId: param[key],
        },
      );
    case 'userId':
      return await services.users.checkUserBelongsToWorkspace({
        workspaceId: user.workspaceId,
        userId: param[key],
      });
    case 'projectId':
      return await services.projects.checkProjectBelongsToWorkspace({
        workspaceId: user.workspaceId,
        projectId: param[key],
      });
    case 'workflowId':
      return await services.workflows.checkWorkflowBelongsToWorkspace({
        workspaceId: user.workspaceId,
        workflowId: param[key],
      });
    case 'workflowTemplateId':
      return await services.workflowTemplates.checkWorkflowTemplateBelongsToWorkspace(
        {
          workspaceId: user.workspaceId,
          workflowTemplateId: param[key],
        },
      );
    case 'agentId':
      return await services.agents.checkAgentBelongsToWorkspace({
        workspaceId: user.workspaceId,
        agentId: param[key],
      });
    case 'taskId':
      return await services.tasks.checkTaskBelongsToWorkspace({
        workspaceId: user.workspaceId,
        taskId: param[key],
      });
    case 'variableId':
      return await services.variables.checkWorkspaceUserHasAccessToVariable({
        workspaceId: user.workspaceId,
        workspaceUserId: user.workspaceUserId,
        variableId: param[key],
      });
    case 'knowledgeId':
      return await services.knowledge.checkWorkspaceUserHasAccessToKnowledge({
        workspaceId: user.workspaceId,
        workspaceUserId: user.workspaceUserId,
        knowledgeId: param[key],
      });
    case 'vectorRefId':
      return await services.knowledge.checkWorkspaceUserHasAccessToVectorRef({
        workspaceId: user.workspaceId,
        workspaceUserId: user.workspaceUserId,
        vectorRefId: param[key],
      });
    case 'connectionId':
      return await services.connections.checkWorkspaceUserHasAccessToConnection(
        {
          workspaceId: user.workspaceId,
          workspaceUserId: user.workspaceUserId,
          connectionId: param[key],
        },
      );
    case 'projectInvitationId':
      return await services.projectInvitations.checkProjectInvitationBelongsToWorkspace(
        {
          invitationId: param[key],
          workspaceId: user.workspaceId,
        },
      );
    case 'executionId':
      return await services.executions.checkExecutionBelongsToWorkspace({
        executionId: param[key],
        workspaceId: user.workspaceId,
      });
    case 'creditId':
      return await services.credits.checkCreditBelongsToWorkspace({
        creditId: param[key],
        workspaceId: user.workspaceId,
      });
    default:
      throw new InternalServerErrorException(
        'BelongsTo decorator key is not supported: ' + key,
      );
  }
};

const matchRoles = (roles?: string[], userRoles?: WorkspaceUserRole[]) => {
  if (!userRoles) {
    //This means the user doesn't belong to an organization
    return false;
  } else if (!roles?.length) {
    //If the there are no roles expected, then we can just go next.
    return true;
  }

  return userRoles.some((role) => roles.includes(role));
};
