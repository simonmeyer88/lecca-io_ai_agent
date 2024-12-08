import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
    this.$use(this.excludeMiddleware);
  }

  /**
   * Middleware to exclude properties from the response unless explicitly asked for.
   */
  async excludeMiddleware(params: any, next: any) {
    const result = await next(params);

    if (result != null) {
      /**
       * Remove password from the User response
       */
      if (params?.model === 'User' && params?.args?.select?.password !== true) {
        if (Array.isArray(result)) {
          result.forEach((r) => {
            delete r.password;
          });
        } else {
          delete result.password;
        }
      }
    }

    return result;
  }
}
