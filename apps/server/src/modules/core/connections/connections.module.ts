import { Module } from '@nestjs/common';
import { ConnectionsService } from './connections.service';
import { ConnectionsController } from './connections.controller';
import { ExecutionsService } from '../executions/executions.service';

@Module({
  controllers: [ConnectionsController],
  providers: [ConnectionsService, ExecutionsService],
  exports: [ConnectionsService],
})
export class ConnectionsModule {}
