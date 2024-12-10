import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { Public } from '../../../decorators/public.decorator';

@Controller('health')
@ApiTags('Health')
@Public()
export class HealthController {
  @Get()
  getHealthStatus() {
    return true;
  }
}
