import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { BelongsTo } from '@/decorators/belongs-to.decorator';
import { Expansion } from '@/decorators/expansion.decorator';
import { FilterBy } from '@/decorators/filter-by.decorator';
import { IncludeType } from '@/decorators/include-type.decorator';
import { Roles } from '@/decorators/roles.decorator';
import { User } from '@/decorators/user.decorator';
import { JwtUser } from '@/types/jwt-user.type';

import { CreateVariableDto } from './dto/create-variable.dto';
import { UpdateVariableDto } from './dto/update-variable.dto';
import { VariableExpansionDto } from './dto/variable-expansion.dto';
import { VariableFilterByDto } from './dto/variable-filter-by.dto';
import { VariableIncludeTypeDto } from './dto/variable-include-type.dto';
import { VariablesService } from './variables.service';

@Controller('variables')
@ApiTags('Variables')
@ApiBearerAuth()
export class VariablesController {
  constructor(private readonly variablesService: VariablesService) {}

  @Post()
  @Roles(['MEMBER'])
  create(
    @User() user: JwtUser,
    @Body() data: CreateVariableDto,
    @Expansion('variables') expansion: VariableExpansionDto,
  ) {
    return this.variablesService.create({
      data,
      workspaceId: user.workspaceId,
      expansion,
    });
  }

  @Get()
  findAllForWorkspace(
    @User() user: JwtUser,
    @IncludeType('variables') includeType: VariableIncludeTypeDto,
    @FilterBy('variables') filterBy: VariableFilterByDto,
    @Expansion('variables') expansion: VariableExpansionDto,
  ) {
    return this.variablesService.findAllForWorkspace({
      jwtUser: user,
      workspaceId: user.workspaceId,
      filterBy,
      includeType,
      expansion,
    });
  }

  @Get(':variableId')
  @Roles()
  @BelongsTo({ owner: 'either', key: 'variableId', roles: ['MAINTAINER'] })
  findOne(
    @Param('variableId') variableId: string,
    @Expansion('variables') expansion: VariableExpansionDto,
  ) {
    return this.variablesService.findOne({
      variableId,
      expansion,
      throwNotFoundException: true,
    });
  }

  @Patch(':variableId')
  @BelongsTo({ owner: 'either', key: 'variableId', roles: ['MAINTAINER'] })
  update(
    @Param('variableId') variableId: string,
    @Body() data: UpdateVariableDto,
    @Expansion('variables') expansion: VariableExpansionDto,
  ) {
    return this.variablesService.update({
      variableId,
      data,
      expansion,
    });
  }

  @Delete(':variableId')
  @BelongsTo({ owner: 'either', key: 'variableId', roles: ['MAINTAINER'] })
  delete(@Param('variableId') variableId: string) {
    return this.variablesService.delete({ variableId });
  }
}
