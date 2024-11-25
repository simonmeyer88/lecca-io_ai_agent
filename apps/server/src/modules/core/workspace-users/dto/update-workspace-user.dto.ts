import { PartialType } from '@nestjs/swagger';

import { CreateWorkspaceUserDto } from './create-workspace-user.dto';

export class UpdateWorkspaceUserDto extends PartialType(
  CreateWorkspaceUserDto,
) {}
