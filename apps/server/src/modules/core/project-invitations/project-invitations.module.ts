import { Module } from '@nestjs/common';
import { ProjectInvitationsService } from './project-invitations.service';
import {
  ProjectInvitationsController,
  ProjectProjectInvitationsController,
} from './project-invitations.controller';

@Module({
  exports: [ProjectInvitationsService],
  controllers: [
    ProjectInvitationsController,
    ProjectProjectInvitationsController,
  ],
  providers: [ProjectInvitationsService],
})
export class ProjectInvitationsModule {}
