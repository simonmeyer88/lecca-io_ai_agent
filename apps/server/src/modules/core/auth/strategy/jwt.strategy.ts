import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Request } from '@/types/request.type';
import { AuthService } from '../auth.service';
import { ServerConfig } from '@/config/server.config';

/**
 * This strategy is the main AuthGuard used throught this application.
 * We will support multiple login strategies, but they will all end up returning
 * access and refresh tokens.
 */

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: ServerConfig.AUTH_JWT_SECRET,
    });
  }

  /**
   * This validate method returns the payload that will be set on the req.user object.
   * Any route that uses this AuthGuard stategy will have access to the user object.
   * We will add all information to this object that is needed for authentication.
   * PROPERTIES:
   * User email
   * User Id
   * WorkspaceUser Id
   * Active Workspace Id
   * Roles
   */
  async validate(payload: any): Promise<Request['user']> {
    //Get user data
    const user = await this.authService.retrieveValidUserByEmail(payload.email);

    const requestUser: Request['user'] = {
      email: user.email,
      userId: user.id,
    };

    //Get active workspace id and workspace user id if they exist
    const { activeWorkspaceId, workspaceUserId, roles } =
      await this.authService.findActiveWorkspaceUserIdAndWorkspaceIdAndRolesForUser(
        user.id,
      );

    if (activeWorkspaceId && workspaceUserId && roles) {
      requestUser.workspaceId = activeWorkspaceId;
      requestUser.workspaceUserId = workspaceUserId;
      requestUser.roles = roles;
    }

    return requestUser;
  }
}
