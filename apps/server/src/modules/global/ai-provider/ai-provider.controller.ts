import { Controller } from '@nestjs/common';
import { AiProviderService } from './ai-provider.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@Controller('ai')
@ApiTags('AI Providers')
@ApiBearerAuth()
export class AiProviderController {
  constructor(private readonly aiProviderService: AiProviderService) {}
}
