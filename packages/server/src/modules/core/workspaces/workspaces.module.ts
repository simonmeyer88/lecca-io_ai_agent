import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { ServerConfig } from '@/config/server.config';

import { UsersService } from '../users/users.service';
import { WorkspaceUsersService } from '../workspace-users/workspace-users.service';

import { WorkspacesController } from './workspaces.controller';
import { WorkspacesService } from './workspaces.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: ServerConfig.AUTH_JWT_SECRET,
      }),
    }),
  ],
  exports: [WorkspacesService],
  controllers: [WorkspacesController],
  providers: [WorkspacesService, WorkspaceUsersService, UsersService],
})
export class WorkspacesModule {}
