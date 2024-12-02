import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { Public } from '@/decorators/public.decorator';

import { AiProviderService } from './ai-provider.service';

@Controller('ai')
@ApiTags('AI Providers')
@ApiBearerAuth()
export class AiProviderController {
  constructor(private readonly aiProviderService: AiProviderService) {}

  @Get('providers')
  @Public()
  async getSubscriptionProducts() {
    return this.aiProviderService.providers;
  }
}
