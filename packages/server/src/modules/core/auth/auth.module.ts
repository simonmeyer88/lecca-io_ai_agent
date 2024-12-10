import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { ServerConfig } from '../../../config/server.config';
import { UsersModule } from '../users/users.module';
import { UsersService } from '../users/users.service';
import { WorkspaceUsersService } from '../workspace-users/workspace-users.service';
import { WorkspacesService } from '../workspaces/workspaces.service';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategy/jwt.strategy';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: ServerConfig.AUTH_JWT_SECRET,
        signOptions: {
          expiresIn: '1h',
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    WorkspacesService,
    JwtStrategy,
    WorkspaceUsersService,
    UsersService,
  ],
})
export class AuthModule {}
