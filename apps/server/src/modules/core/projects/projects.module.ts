import { Module } from '@nestjs/common';

import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';

@Module({
  exports: [ProjectsService],
  controllers: [ProjectsController],
  providers: [ProjectsService],
})
export class ProjectsModule {}
