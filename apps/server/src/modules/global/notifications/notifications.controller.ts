import { Controller, Get, Param, Delete, Post } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtUser } from '@/types/jwt-user.type';
import { User } from '@/decorators/user.decorator';
import { BelongsTo } from '@/decorators/belongs-to.decorator';

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
