import {
  Controller,
  ForbiddenException,
  Get,
  Param,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { Public } from '../../../decorators/public.decorator';
import { Roles } from '../../../decorators/roles.decorator';
import { User } from '../../../decorators/user.decorator';
import { JwtUser } from '../../../types/jwt-user.type';

import { AiProvider, AiProviderService } from './ai-provider.service';

@Controller('ai')
@ApiTags('AI Providers')
@ApiBearerAuth()
export class AiProviderController {
  constructor(private readonly aiProviderService: AiProviderService) {}

  @Get('providers')
  @Public()
  async getProviders() {
    return this.aiProviderService.providers;
  }

  @Get('providers/:providerId/language-models')
  @Roles()
  async getProviderLanguageModels(
    @User() user: JwtUser,
    @Param('providerId') providerId: string,
    @Query('connectionId') connectionId: string,
  ) {
    if (connectionId !== 'credits' || connectionId != null) {
      const hasAccessToConnection =
        await this.aiProviderService.checkWorkspaceUserHasAccessToConnection({
          workspaceUserId: user.workspaceUserId,
          workspaceId: user.workspaceId,
          connectionId,
        });

      if (!hasAccessToConnection) {
        throw new ForbiddenException(
          'User does not have access to the connection',
        );
      }
    }

    return await this.aiProviderService.getLanguageModelsByProviderAndConnectionId(
      {
        aiProvider: providerId as AiProvider,
        connectionId,
      },
    );
  }
}
