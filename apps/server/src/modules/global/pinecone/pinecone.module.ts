import { Global, Module } from '@nestjs/common';
import { PineconeService } from './pinecone.service';
import { DiscoveryModule } from '@nestjs/core';

@Global()
@Module({
  providers: [PineconeService],
  exports: [PineconeService],
  imports: [DiscoveryModule],
})
export class PineconeModule {}
