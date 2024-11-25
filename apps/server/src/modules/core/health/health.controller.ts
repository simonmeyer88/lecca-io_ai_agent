import { Public } from '@/decorators/public.decorator';
import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@Controller('health')
@ApiTags('Health')
@Public()
export class HealthController {
  @Get()
  getHealthStatus() {
    return true;
  }
}
