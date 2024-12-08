import { Global, Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';

import { PineconeService } from './pinecone.service';

@Global()
@Module({
  providers: [PineconeService],
  exports: [PineconeService],
  imports: [DiscoveryModule],
})
export class PineconeModule {}
