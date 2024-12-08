import { Module } from '@nestjs/common';

import { ExecutionsService } from '../executions/executions.service';

import { ConnectionsController } from './connections.controller';
import { ConnectionsService } from './connections.service';

@Module({
  controllers: [ConnectionsController],
  providers: [ConnectionsService, ExecutionsService],
  exports: [ConnectionsService],
})
export class ConnectionsModule {}
