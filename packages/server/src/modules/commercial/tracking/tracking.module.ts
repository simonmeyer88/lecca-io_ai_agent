import { Global, Module } from '@nestjs/common';

import { TracerService } from './tracing.service';

@Global()
@Module({
  exports: [],
  providers: [TracerService],
})
export class TrackingModule {}
