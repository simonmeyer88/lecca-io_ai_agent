import { Global, Module } from '@nestjs/common';

import { S3ManagerService } from './s3.service';

@Global()
@Module({
  imports: [],
  providers: [S3ManagerService],
  exports: [S3ManagerService],
})
export class S3ManagerModule {}
