import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { BelongsTo } from '@/decorators/belongs-to.decorator';
import { Expansion } from '@/decorators/expansion.decorator';
import { FilterBy } from '@/decorators/filter-by.decorator';
import { IncludeType } from '@/decorators/include-type.decorator';
import { Public } from '@/decorators/public.decorator';
import { Roles } from '@/decorators/roles.decorator';
import { User } from '@/decorators/user.decorator';
import { JwtUser } from '@/types/jwt-user.type';

import { ConnectionsService } from './connections.service';
import { ConnectionExpansionDto } from './dto/connection-expansion.dto';
import { ConnectionFilterByDto } from './dto/connection-filter-by.dto';
import { ConnectionIncludeTypeDto } from './dto/connection-include-type.dto';
import { UpdateConnectionDto } from './dto/update-connection.dto';

@Controller('connections')
@ApiTags('Connections')
@ApiBearerAuth()
export class ConnectionsController {
  constructor(private readonly connectionsService: ConnectionsService) {}

  @Get()
  @Roles()
  findAllForWorkspace(
    @User() user: JwtUser,
    @IncludeType('connections') includeType: ConnectionIncludeTypeDto,
    @Expansion('connections') expansion: ConnectionExpansionDto,
    @FilterBy('connections') filterBy: ConnectionFilterByDto,
  ) {
    return this.connectionsService.findAllForWorkspace({
      jwtUser: user,
      workspaceId: user.workspaceId,
      expansion,
      includeType,
      filterBy,
    });
  }

  @Get(':connectionId')
  @Roles()
  @BelongsTo({ owner: 'either', key: 'connectionId', roles: ['MAINTAINER'] })
  findOne(
    @Param('connectionId') connectionId: string,
    @Expansion('connections') expansion: ConnectionExpansionDto,
  ) {
    return this.connectionsService.findOne({
      connectionId,
      expansion,
      throwNotFoundException: true,
    });
  }

  @Patch(':connectionId')
  @Roles()
  @BelongsTo({ owner: 'either', key: 'connectionId', roles: ['MAINTAINER'] })
  update(
    @Param('connectionId') connectionId: string,
    @Body() data: UpdateConnectionDto,
    @Expansion('connections') expansion: ConnectionExpansionDto,
  ) {
    return this.connectionsService.update({
      connectionId,
      data,
      expansion,
    });
  }

  @Delete(':connectionId')
  @BelongsTo({ owner: 'either', key: 'connectionId', roles: ['MAINTAINER'] })
  delete(@Param('connectionId') connectionId: string) {
    return this.connectionsService.delete({ connectionId });
  }

  @Public()
  @Post('deauthorize/:appId')
  @HttpCode(200)
  handleDeauthorizeCallback() {
    /**
     * Only added this because instagram api requires a deauthorize endpoint
     * and I'm sure other platforms will too
     */

    //TODO: Take the request received and process it
    return;
  }

  @Public()
  @Post('deletion-request/:appId')
  @HttpCode(200)
  handleDataDeletionRequest() {
    /**
     * Only added this because instagram api requires a deauthorize endpoint
     * and I'm sure other platforms will too
     */

    //TODO: Take the request received and process it
    return;
  }
}
