import { Controller, Get, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { BelongsTo } from '../../../decorators/belongs-to.decorator';
import { Expansion } from '../../../decorators/expansion.decorator';
import { FilterBy } from '../../../decorators/filter-by.decorator';
import { IncludeType } from '../../../decorators/include-type.decorator';
import { Roles } from '../../../decorators/roles.decorator';
import { User } from '../../../decorators/user.decorator';
import { JwtUser } from '../../../types/jwt-user.type';

import { CreditsService } from './credits.service';
import { CreditExpansionDto } from './dto/credit-expansion.dto';
import { CreditFilterByDto } from './dto/credit-filter-by.dto';
import { CreditIncludeTypeDto } from './dto/credit-include-type.dto';

@Controller('credits')
@ApiTags('Credits')
@ApiBearerAuth()
export class CreditsController {
  constructor(private readonly creditsService: CreditsService) {}

  @Get()
  @Roles()
  findAll(
    @User() user: JwtUser,
    @IncludeType('credits') includeType: CreditIncludeTypeDto,
    @Expansion('credits') expansion: CreditExpansionDto,
    @FilterBy('credits') filterBy: CreditFilterByDto,
  ) {
    return this.creditsService.findAllForWorkspace({
      jwtUser: user,
      workspaceId: user.workspaceId,
      expansion,
      includeType,
      filterBy,
    });
  }

  @Get('remaining')
  @Roles()
  getRemainingWorkspaceCredits(@User() user: JwtUser) {
    return this.creditsService.getWorkspaceTotalCredits({
      workspaceId: user.workspaceId,
    });
  }

  @Get(':creditId')
  @Roles()
  @BelongsTo({ owner: 'either', key: 'creditId', roles: ['MAINTAINER'] })
  findOne(
    @Param('creditId') creditId: string,
    @Expansion('credits') expansion: CreditExpansionDto,
  ) {
    return this.creditsService.findOne({
      creditId,
      expansion,
      throwNotFoundException: true,
    });
  }
}
