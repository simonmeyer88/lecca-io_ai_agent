import { Body, Controller, Delete, Get, Param, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { BelongsTo } from '@/decorators/belongs-to.decorator';
import { Expansion } from '@/decorators/expansion.decorator';
import { IncludeType } from '@/decorators/include-type.decorator';
import { User } from '@/decorators/user.decorator';
import { JwtUser } from '@/types/jwt-user.type';

import { UpdateUserDto } from './dto/update-user.dto';
import { UserExpansionDto } from './dto/user-expansion.dto';
import { UserIncludeTypeDto } from './dto/user-include-type.dto';
import { UsersService } from './users.service';

@Controller('users')
@ApiTags('Users')
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get('me')
  findMe(@User() user: JwtUser) {
    return this.userService.findMe({
      userId: user.userId,
      throwNotFoundException: true,
    });
  }

  @Patch('me')
  updateMe(@User() user: JwtUser, @Body() data: UpdateUserDto) {
    return this.userService.updateMe({ userId: user.userId, data });
  }

  @Get(':userId')
  @BelongsTo({ owner: 'either', key: 'userId' })
  findOne(
    @Param('userId') userId: string,
    @IncludeType('users') includeType: UserIncludeTypeDto,
    @Expansion('users') expansion: UserExpansionDto,
  ) {
    return this.userService.findOneById({
      userId,
      includeType,
      expansion,
      throwNotFoundException: true,
    });
  }

  @Patch(':userId')
  @BelongsTo({ owner: 'me', key: 'userId' })
  update(
    @Param('userId') userId: string,
    @Body() data: UpdateUserDto,
    @IncludeType('users') includeType: UserIncludeTypeDto,
    @Expansion('users') expansion: UserExpansionDto,
  ) {
    return this.userService.update({ userId, data, includeType, expansion });
  }

  @Delete(':userId')
  @BelongsTo({ owner: 'me', key: 'userId' })
  delete(@Param('userId') userId: string) {
    return this.userService.delete({ userId });
  }
}
