// operations.module.ts
import { Global, Module } from '@nestjs/common';
import { OperationsService } from './operations.service';
import { HttpModule } from '@nestjs/axios';

@Global()
@Module({
  providers: [OperationsService],
  exports: [OperationsService],
  imports: [HttpModule],
})
export class OperationsModule {}
