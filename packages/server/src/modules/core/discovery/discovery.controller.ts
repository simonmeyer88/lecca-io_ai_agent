import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { Roles } from '../../../decorators/roles.decorator';
import { User } from '../../../decorators/user.decorator';
import { JwtUser } from '../../../types/jwt-user.type';

import { DiscoveryService } from './discovery.service';

@Controller('discovery')
@ApiTags('Discovery')
export class DiscoveryController {
  constructor(private readonly discoveryService: DiscoveryService) {}

  @Get('/enabled-features')
  @Roles()
  getEnabledWorkspaceFeatures(@User() user: JwtUser) {
    return this.discoveryService.getEnabledWorkspaceFeatures({
      workspaceId: user.workspaceId,
    });
  }
}
