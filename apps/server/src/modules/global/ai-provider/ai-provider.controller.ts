import { Controller } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { AiProviderService } from './ai-provider.service';

@Controller('ai')
@ApiTags('AI Providers')
@ApiBearerAuth()
export class AiProviderController {
  constructor(private readonly aiProviderService: AiProviderService) {}
}
