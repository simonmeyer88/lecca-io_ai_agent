import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtUser } from '@/types/jwt-user.type';
import { KnowledgeService } from './knowledge.service';
import { CreateKnowledgeDto } from './dto/create-knowledge.dto';
import { KnowledgeExpansionDto } from './dto/knowledge-expansion.dto';
import { KnowledgeIncludeTypeDto } from './dto/knowledge-include-type.dto';
import { KnowledgeFilterByDto } from './dto/knowledge-filter-by.dto';
import { UpdateKnowledgeDto } from './dto/update-knowledge.dto';
import { SaveUploadedTextToKnowledgeDto } from './dto/save-uploaded-text-to-knowledge.dto';
import { Roles } from '@/decorators/roles.decorator';
import { User } from '@/decorators/user.decorator';
import { Expansion } from '@/decorators/expansion.decorator';
import { IncludeType } from '@/decorators/include-type.decorator';
import { FilterBy } from '@/decorators/filter-by.decorator';
import { BelongsTo } from '@/decorators/belongs-to.decorator';

@Controller('knowledge')
@ApiTags('Knowledge')
@ApiBearerAuth()
export class KnowledgeController {
  constructor(private readonly knowledgeService: KnowledgeService) {}

  @Post()
  @Roles(['MEMBER'])
  create(
    @User() user: JwtUser,
    @Body() data: CreateKnowledgeDto,
    @Expansion('knowledge') expansion: KnowledgeExpansionDto,
  ) {
    return this.knowledgeService.create({
      data,
      workspaceId: user.workspaceId,
      expansion,
    });
  }

  @Get()
  findAllForWorkspace(
    @User() user: JwtUser,
    @IncludeType('knowledge') includeType: KnowledgeIncludeTypeDto,
    @FilterBy('knowledge') filterBy: KnowledgeFilterByDto,
    @Expansion('knowledge') expansion: KnowledgeExpansionDto,
  ) {
    return this.knowledgeService.findAllForWorkspace({
      jwtUser: user,
      workspaceId: user.workspaceId,
      filterBy,
      includeType,
      expansion,
    });
  }

  @Get(':knowledgeId')
  @Roles()
  @BelongsTo({ owner: 'either', key: 'knowledgeId', roles: ['MAINTAINER'] })
  findOne(
    @Param('knowledgeId') knowledgeId: string,
    @Expansion('knowledge') expansion: KnowledgeExpansionDto,
  ) {
    return this.knowledgeService.findOne({
      knowledgeId,
      expansion,
      throwNotFoundException: true,
    });
  }

  @Patch(':knowledgeId')
  @BelongsTo({ owner: 'either', key: 'knowledgeId', roles: ['MAINTAINER'] })
  update(
    @Param('knowledgeId') knowledgeId: string,
    @Body() data: UpdateKnowledgeDto,
    @Expansion('knowledge') expansion: KnowledgeExpansionDto,
  ) {
    return this.knowledgeService.update({
      knowledgeId,
      data,
      expansion,
    });
  }

  @Delete(':knowledgeId')
  @BelongsTo({ owner: 'either', key: 'knowledgeId', roles: ['MAINTAINER'] })
  delete(@Param('knowledgeId') knowledgeId: string) {
    return this.knowledgeService.delete({ knowledgeId });
  }

  @Post(':knowledgeId/saveUploadedText')
  @BelongsTo({ owner: 'either', key: 'knowledgeId', roles: ['MAINTAINER'] })
  saveUploadedTextToKnowledge(
    @User() user: JwtUser,
    @Param('knowledgeId') knowledgeId: string,
    @Body() data: SaveUploadedTextToKnowledgeDto,
  ) {
    return this.knowledgeService.saveUploadedTextToKnowledge({
      data,
      workspaceId: user.workspaceId,
      knowledgeId,
    });
  }

  @Get(':knowledgeId/vectorRefs')
  @BelongsTo({ owner: 'either', key: 'knowledgeId', roles: ['MAINTAINER'] })
  getVectorRefs(@Param('knowledgeId') knowledgeId: string) {
    return this.knowledgeService.findAllVectorRefsForKnowledge({
      knowledgeId,
    });
  }

  @Delete(':knowledgeId/vectorRefs/:vectorRefId/vectorRefGroup')
  @BelongsTo({ owner: 'either', key: 'knowledgeId', roles: ['MAINTAINER'] })
  @BelongsTo({ owner: 'either', key: 'vectorRefId', roles: ['MAINTAINER'] })
  deleteVectorRefGroupByVectorRefId(
    @Param('knowledgeId') knowledgeId: string,
    @Param('vectorRefId') vectorRefId: string,
  ) {
    return this.knowledgeService.deleteVectorRefGroupByVectorRefId({
      knowledgeId,
      vectorRefId,
    });
  }

  @Delete(':knowledgeId/vectorRefs/:vectorRefId')
  @BelongsTo({ owner: 'either', key: 'knowledgeId', roles: ['MAINTAINER'] })
  @BelongsTo({ owner: 'either', key: 'vectorRefId', roles: ['MAINTAINER'] })
  deleteVectorRef(
    @Param('knowledgeId') knowledgeId: string,
    @Param('vectorRefId') vectorRefId: string,
  ) {
    return this.knowledgeService.deleteVectorRef({
      knowledgeId,
      vectorRefId,
    });
  }

  @Get(':knowledgeId/vectorRefs/:vectorRefId')
  @BelongsTo({ owner: 'either', key: 'knowledgeId', roles: ['MAINTAINER'] })
  @BelongsTo({ owner: 'either', key: 'vectorRefId', roles: ['MAINTAINER'] })
  queryKnowledgeByVectorRefId(@Param('vectorRefId') vectorRefId: string) {
    return this.knowledgeService.queryKnowledgeByVectorRefId({
      vectorRefId,
    });
  }
}
