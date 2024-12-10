import { Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { BelongsTo } from '../../../decorators/belongs-to.decorator';
import { User } from '../../../decorators/user.decorator';
import { JwtUser } from '../../../types/jwt-user.type';

import { NotificationsService } from './notifications.service';

@Controller('notifications')
@ApiTags('Notifications')
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  findAll(@User() user: JwtUser) {
    return this.notificationsService.findAllForWorkspaceUser({
      workspaceUserId: user.workspaceUserId,
    });
  }

  @Post()
  markAllAsRead(@User() user: JwtUser) {
    return this.notificationsService.markAllAsReadForWorkspaceUser({
      workspaceUserId: user.workspaceUserId,
    });
  }

  @Post(':notificationId')
  @BelongsTo({ owner: 'me', key: 'notificationId' })
  markAsRead(@Param('notificationId') notificationId: string) {
    return this.notificationsService.markAsRead({
      notificationId,
    });
  }

  @Delete(':notificationId')
  @BelongsTo({ owner: 'me', key: 'notificationId' })
  delete(@Param('notificationId') notificationId: string) {
    return this.notificationsService.delete({
      notificationId,
    });
  }
}
