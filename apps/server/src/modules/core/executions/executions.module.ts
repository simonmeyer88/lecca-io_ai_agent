import { Module } from '@nestjs/common';

import { ExecutionsController } from './executions.controller';
import { ExecutionsService } from './executions.service';

@Module({
  exports: [ExecutionsService],
  controllers: [ExecutionsController],
  providers: [ExecutionsService],
})
export class ExecutionsModule {}
