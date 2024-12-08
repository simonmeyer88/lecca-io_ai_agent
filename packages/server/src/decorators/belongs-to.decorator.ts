import { Reflector } from '@nestjs/core';
import { WorkspaceUserRole } from '@prisma/client';

export type BelongsToOptions<T extends 'me' | 'workspace' | 'either'> =
  T extends 'me'
    ? //me
      { owner: T; key: string }
    : T extends 'workspace'
      ? //workspace
        { owner: T; key: string; roles?: (keyof typeof WorkspaceUserRole)[] }
      : //either
        { owner: T; key: string; roles?: (keyof typeof WorkspaceUserRole)[] };

export const BelongsTo =
  Reflector.createDecorator<BelongsToOptions<'me' | 'workspace' | 'either'>>();
