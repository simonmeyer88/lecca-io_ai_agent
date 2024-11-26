import { Global, Module } from '@nestjs/common';

import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';

@Global()
@Module({
  exports: [NotificationsService],
  controllers: [NotificationsController],
  providers: [NotificationsService],
})
export class NotificationsModule {}
