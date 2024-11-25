import { Injectable, NestMiddleware } from '@nestjs/common';
// import { json } from 'body-parser';
import * as bodyParser from 'body-parser';

/**
 * Copied this middleware to parse the raw response into a param to use later
 * from https://github.com/golevelup/nestjs/blob/master/packages/webhooks/src/webhooks.middleware.ts
 */

@Injectable()
export class RawBodyMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: () => any) {
    bodyParser.json({
      verify: (req: any, res, buffer) => {
        if (Buffer.isBuffer(buffer)) {
          const rawBody = Buffer.from(buffer);
          req['parsedRawBody'] = rawBody;
        }
      },
    })(req as any, res as any, next);
  }
}
