import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { ServerConfig } from '../config/server.config';
import { CommercialKey } from '../decorators/commercial.decorator';

@Injectable()
export class CommercialKeyGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext) {
    const CommercialDecorator = this.reflector.get(
      CommercialKey,
      context.getHandler(),
    );

    if (!CommercialDecorator) {
      return true;
    } else {
      //We're not validating the key at the moment. Just if it exists
      if (!ServerConfig.COMMERCIAL_KEY) {
        throw new UnauthorizedException(
          'This feature is not available in the community edition.',
        );
      } else {
        return true;
      }
    }
  }
}
