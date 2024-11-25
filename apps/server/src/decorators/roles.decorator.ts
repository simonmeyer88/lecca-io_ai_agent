import { Reflector } from '@nestjs/core';
import { WorkspaceUserRole } from '@prisma/client';

export const Roles =
  Reflector.createDecorator<(keyof typeof WorkspaceUserRole)[]>();
