import { Module } from '@nestjs/common';

import {
  ProjectInvitationsController,
  ProjectProjectInvitationsController,
} from './project-invitations.controller';
import { ProjectInvitationsService } from './project-invitations.service';

@Module({
  exports: [ProjectInvitationsService],
  controllers: [
    ProjectInvitationsController,
    ProjectProjectInvitationsController,
  ],
  providers: [ProjectInvitationsService],
})
export class ProjectInvitationsModule {}
