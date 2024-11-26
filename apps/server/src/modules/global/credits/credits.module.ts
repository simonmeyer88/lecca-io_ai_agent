import { Global, Module } from '@nestjs/common';

import { CreditsController } from './credits.controller';
import { CreditsService } from './credits.service';

@Global()
@Module({
  controllers: [CreditsController],
  exports: [CreditsService],
  providers: [CreditsService],
})
export class CreditsModule {}
