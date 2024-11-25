import { Controller, Get, Body, Patch, Param, Put, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtUser } from '@/types/jwt-user.type';
import { UpdateProfileImageDto } from './dto/update-profile-image.dto';
import { UpdateWorkspaceUserRolesDto } from './dto/update-workspace-user-roles.dto';
import { UpdateWorkspaceUserDto } from './dto/update-workspace-user.dto';
import { WorkspaceUserExpansionDto } from './dto/workspace-user-expansion.dto';
import { WorkspaceUserFilterByDto } from './dto/workspace-user-filter-by.dto';
import { WorkspaceUsersService } from './workspace-users.service';
import { Roles } from '@/decorators/roles.decorator';
import { User } from '@/decorators/user.decorator';
import { Expansion } from '@/decorators/expansion.decorator';
import { FilterBy } from '@/decorators/filter-by.decorator';
import { BelongsTo } from '@/decorators/belongs-to.decorator';

@Controller('workspace-users')
@ApiTags('Workspace Users')
@ApiBearerAuth()
export class WorkspaceUsersController {
  constructor(private readonly workspaceUsersService: WorkspaceUsersService) {}

  @Get()
  @Roles()
  findAll(
    @User() user: JwtUser,
    @Expansion('workspace-users') expansion: WorkspaceUserExpansionDto,
    @FilterBy('workspace-users') filterBy: WorkspaceUserFilterByDto,
  ) {
    return this.workspaceUsersService.findAllForWorkspace({
      workspaceId: user.workspaceId,
      filterBy,
      expansion,
    });
  }

  @Get('me')
  @Roles()
  findMe(@User() user: JwtUser) {
    return this.workspaceUsersService.findMe({
      workspaceUserId: user.workspaceUserId,
      throwNotFoundException: true,
    });
  }

  @Get(':workspaceUserId')
  @Roles()
  @BelongsTo({ owner: 'workspace', key: 'workspaceUserId' })
  findOne(
    @Param('workspaceUserId') workspaceUserId: string,
    @Expansion('workspace-users') expansion: WorkspaceUserExpansionDto,
  ) {
    return this.workspaceUsersService.findOne({
      workspaceUserId,
      expansion,
      throwNotFoundException: true,
    });
  }

  @Patch('me')
  @Roles()
  update(
    @User() user: JwtUser,
    @Body() data: UpdateWorkspaceUserDto,
    @Expansion('workspace-users') expansion: WorkspaceUserExpansionDto,
  ) {
    return this.workspaceUsersService.update({
      workspaceUserId: user.workspaceUserId,
      data,
      expansion,
    });
  }

  @Post(':workspaceUserId/profile-image-post-url')
  @Roles()
  @BelongsTo({ owner: 'me', key: 'workspaceUserId' })
  getPresignedPostUrlForProfileImage(
    @Param('workspaceUserId') workspaceUserId: string,
    @User() user: JwtUser,
    @Body() data: UpdateProfileImageDto,
  ) {
    //This doesn't update the profile image, it just returns a presigned post url to upload a new profile image
    return this.workspaceUsersService.getPresignedPostUrlForProfileImage({
      fileName: data.fileName,
      workspaceUserId,
      workspaceId: user.workspaceId,
    });
  }

  @Put(':workspaceUserId/roles')
  @Roles(['MAINTAINER'])
  updateRoles(
    @User() user: JwtUser,
    @Param('workspaceUserId') workspaceUserId: string,
    @Body() data: UpdateWorkspaceUserRolesDto,
    @Expansion('workspace-users') expansion: WorkspaceUserExpansionDto,
  ) {
    return this.workspaceUsersService.updateRoles({
      workspaceUserId,
      data,
      expansion,
      jwtUser: user,
    });
  }
}
