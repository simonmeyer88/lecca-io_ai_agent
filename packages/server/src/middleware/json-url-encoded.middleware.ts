import { Injectable, NestMiddleware } from '@nestjs/common';
import * as bodyParser from 'body-parser';

@Injectable()
export class JsonUrlEncodedMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: () => any) {
    bodyParser.urlencoded({ limit: '10mb', extended: true })(
      req as any,
      res as any,
      next,
    );
  }
}
