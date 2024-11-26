import { Body, Controller, Get, Param, Post, Req, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';

import { WorkflowAppsKey } from '@/apps/public/workflow-apps';
import { Public } from '@/decorators/public.decorator';
import { Roles } from '@/decorators/roles.decorator';
import { User } from '@/decorators/user.decorator';
import { JwtUser } from '@/types/jwt-user.type';

import { RunNodeDto } from './dto/run-node.dto';
import { WorkflowAppsService } from './workflow-apps.service';

@Controller('workflow-apps')
@ApiTags('Workflow Apps')
@ApiBearerAuth()
export class WorkflowAppsController {
  constructor(private readonly workflowAppsService: WorkflowAppsService) {}

  @Get()
  @Public()
  findAll() {
    return this.workflowAppsService.findAll();
  }

  @Get('oauth2callback')
  @Public()
  connectAppCallback(@Res() res: Response, @Req() req: Request) {
    try {
      return this.workflowAppsService.handleOAuth2Callback({
        res,
        req,
      });
    } catch (error) {
      return res.status(500).send({ status: '500', message: error.message });
    }
  }

  @Post('runNode')
  @Roles()
  testNode(@Body() body: RunNodeDto, @User() user: JwtUser) {
    return this.workflowAppsService.testNode({
      data: body,
      workspaceId: user.workspaceId,
      workspaceUserId: user.workspaceUserId,
    });
  }

  @Post(':appId/actions/:actionId/dynamic-values')
  @Roles()
  retrieveActionDynamicValues(
    @Param('appId') appId: WorkflowAppsKey,
    @Param('actionId') actionId: string,
    @Body() body: Record<string, any>,
    @User() user: JwtUser,
  ) {
    return this.workflowAppsService.retrieveActionDynamicValues({
      appId,
      actionId,
      connectionId: body.connectionId,
      fieldId: body.fieldId,
      projectId: body.projectId,
      workspaceUserId: user.workspaceUserId,
      workspaceId: user.workspaceId,
      workflowId: body.workflowId,
      agentId: body.agentId,
      extraOptions: body.extraOptions,
    });
  }

  @Post(':appId/triggers/:triggerId/dynamic-values')
  @Roles()
  retrieveTriggerDynamicValues(
    @Param('appId') appId: WorkflowAppsKey,
    @Param('triggerId') triggerId: string,
    @Body() body: Record<string, any>,
    @User() user: JwtUser,
  ) {
    return this.workflowAppsService.retrieveTriggerDynamicValues({
      appId,
      triggerId,
      connectionId: body.connectionId,
      fieldId: body.fieldId,
      projectId: body.projectId,
      workflowId: body.workflowId,
      workspaceUserId: user.workspaceUserId,
      workspaceId: user.workspaceId,
      agentId: body.agentId,
      extraOptions: body.extraOptions,
    });
  }

  @Post(':appId/connections/:connectionId/connect')
  @Roles()
  connectApp(
    @User() user: JwtUser,
    @Param('appId') appId: WorkflowAppsKey,
    @Param('connectionId') connectionId: string,
    @Res() res: Response,
    @Req() req: Request,
    @Body() value: Record<string, any>,
  ) {
    try {
      return this.workflowAppsService.connectApp({
        appId,
        connectionId,
        workspaceId: user.workspaceId,
        value,
        res,
        req,
      });
    } catch (error) {
      return res.status(500).send({ status: '500', message: error.message });
    }
  }
}
