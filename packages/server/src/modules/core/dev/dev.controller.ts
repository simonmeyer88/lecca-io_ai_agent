import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';

import { ServerConfig } from '../../../config/server.config';
import { Roles } from '../../../decorators/roles.decorator';
import { User } from '../../../decorators/user.decorator';
import { JwtUser } from '../../../types/jwt-user.type';

import { DevService } from './dev.service';
import { DevUpdateWorkspaceCreditDto } from './dto/dev-update-workspace-credit.dto';

/**
 * Used for dev purposes only.
 *
 * We can add endpoints to debug, test, update, or delete data.
 * It makes it easier than using the database directly sometimes.
 */

@Controller('dev')
@ApiBearerAuth()
export class DevController {
  constructor(private readonly devService: DevService) {}

  @Get('workspaces')
  @Roles()
  getWorkspaces(@User() user: JwtUser) {
    if (!user.email.includes(ServerConfig.DEV_EMAIL_DOMAIN)) {
      throw new ForbiddenException(
        'You are not allowed to perform this action',
      );
    } else {
      return this.devService.getWorkspaces();
    }
  }

  @Post('update-workspace-credits')
  @Roles()
  updateWorkspaceCredits(
    @User() user: JwtUser,
    @Body() body: DevUpdateWorkspaceCreditDto,
  ) {
    if (!user.email.includes(ServerConfig.DEV_EMAIL_DOMAIN)) {
      throw new ForbiddenException(
        'You are not allowed to perform this action',
      );
    } else {
      return this.devService.updateWorkspaceCredits(body);
    }
  }
}
