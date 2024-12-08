import { Global, Module } from '@nestjs/common';

import { DiscoveryController } from './discovery.controller';
import { DiscoveryService } from './discovery.service';

@Global()
@Module({
  exports: [DiscoveryService],
  controllers: [DiscoveryController],
  providers: [DiscoveryService],
})
export class DiscoveryModule {}
