import { Module } from '@nestjs/common';
import { JwtStrategy } from './strategy/jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '@/modules/core/users/users.module';
import { UsersService } from '@/modules/core/users/users.service';
import { WorkspaceUsersService } from '@/modules/core/workspace-users/workspace-users.service';
import { WorkspacesService } from '@/modules/core/workspaces/workspaces.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ServerConfig } from '@/config/server.config';

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
