import { Module } from '@nestjs/common';

import { VariablesController } from './variables.controller';
import { VariablesService } from './variables.service';

@Module({
  exports: [VariablesService],
  controllers: [VariablesController],
  providers: [VariablesService],
})
export class VariablesModule {}
