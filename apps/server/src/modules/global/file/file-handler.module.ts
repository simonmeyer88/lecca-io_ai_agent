import { Global, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { FileHandlerService } from './file-handler.service';

@Global()
@Module({
  imports: [HttpModule],
  providers: [FileHandlerService],
  exports: [FileHandlerService],
})
export class FileHandlerModule {}
