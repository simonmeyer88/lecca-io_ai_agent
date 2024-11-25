import { PartialType } from '@nestjs/swagger';

import { CreateWorkspaceInvitationDto } from './create-workspace-invitation.dto';

export class UpdateWorkspaceInvitationDto extends PartialType(
  CreateWorkspaceInvitationDto,
) {}
