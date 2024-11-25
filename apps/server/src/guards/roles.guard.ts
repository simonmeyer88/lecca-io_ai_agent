import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Roles } from '../decorators/roles.decorator';

/**
 * This guard checks if a user has the correct roles to complete an action.
 * If the @Roles() guard has no roles passed in the first argument, then it will check if the user belongs to an organization.
 */

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext) {
    let roles = this.reflector.get(Roles, context.getHandler());
    if (!roles) {
      //If the @Roles() decorator is not used, then this guard will not be applied
      return true;
    }

    if (!Array.isArray(roles)) {
      /**
       * If you don't pass anything into the @Roles() decorator, then it will an empty object {}. We'll convert it to an empty array.
       * An Empty @Roles() decorator checks that a user belongs to an organization. This works because a user that doesn't
       * belong to an organization will have `roles: undefined` instead of `roles: []`
       */
      roles = [];
    }
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException(
        'Please log out and log back in to continue.',
      );
    }

    if (matchRoles(roles, user.roles)) {
      return true;
    }

    throw new ForbiddenException(
      'You do not have permission to complete this action.',
    );
  }
}

function matchRoles(roles: string[], userRoles: string[]) {
  if (!userRoles) {
    //This means the user doesn't belong to an organization
    return false;
  } else if (roles.length === 0) {
    //No roles is just checking if the user belongs to an organization
    //We know a user belongs to an organization if they have a roles array. Even if the array is empty.
    return true;
  }

  return userRoles.some((role) => roles.includes(role));
}
