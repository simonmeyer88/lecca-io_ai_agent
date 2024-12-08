// operations.module.ts
import { HttpModule } from '@nestjs/axios';
import { Global, Module } from '@nestjs/common';

import { OperationsService } from './operations.service';

@Global()
@Module({
  providers: [OperationsService],
  exports: [OperationsService],
  imports: [HttpModule],
})
export class OperationsModule {}
