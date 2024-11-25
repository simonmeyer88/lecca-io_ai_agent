import { Global, Module } from '@nestjs/common';
import { CreditsService } from './credits.service';
import { CreditsController } from './credits.controller';

@Global()
@Module({
  controllers: [CreditsController],
  exports: [CreditsService],
  providers: [CreditsService],
})
export class CreditsModule {}
