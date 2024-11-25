import { Module } from '@nestjs/common';
import { WorkspaceInvitationsService } from './workspace-invitations.service';
import { WorkspaceInvitationsController } from './workspace-invitations.controller';
import { JwtModule } from '@nestjs/jwt';
import { ServerConfig } from '@/config/server.config';
import { WorkspacesService } from '@/modules/core/workspaces/workspaces.service';
import { WorkspaceUsersService } from '@/modules/core/workspace-users/workspace-users.service';
import { UsersService } from '@/modules/core/users/users.service';

@Module({
  exports: [WorkspaceInvitationsService],
  imports: [
    //Had to add this JwtModule to use the WorkspaceService
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: ServerConfig.AUTH_JWT_SECRET,
      }),
    }),
  ],
  controllers: [WorkspaceInvitationsController],
  providers: [
    WorkspaceInvitationsService,
    WorkspacesService,
    WorkspaceUsersService, //Had to add these to use the WorkspaceService
    UsersService, //Had to add these to use the WorkspaceService
  ],
})
export class WorkspaceInvitationsModule {}
