import { PartialType } from '@nestjs/swagger';

import { CreateProjectInvitationDto } from './create-project-invitation.dto';

export class UpdateProjectInvitationDto extends PartialType(
  CreateProjectInvitationDto,
) {}
