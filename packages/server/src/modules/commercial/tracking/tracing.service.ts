// tracer.service.ts
import { Injectable } from '@nestjs/common';
import { Span, SpanStatusCode, trace } from '@opentelemetry/api';

import { JwtUser } from '../../../types/jwt-user.type';

@Injectable()
export class TracerService {
  private readonly tracer = trace.getTracer('your-app-name');

  startSpan(
    operationName: string,
    jwtUser?: JwtUser,
    additionalAttributes = {},
  ) {
    //Remove PIIs from the JWT user object
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { email, ...user } = jwtUser ?? {};

    return this.tracer.startSpan(operationName, {
      attributes: {
        ...user,
        ...additionalAttributes,
      },
    });
  }

  endSpan(span: Span, success = true) {
    span.setStatus({
      code: success ? SpanStatusCode.OK : SpanStatusCode.ERROR,
    });
    span.end();
  }

  handleError(span: Span, error: Error) {
    span.setStatus({
      code: SpanStatusCode.ERROR,
      message: error.message,
    });
    span.recordException(error);
  }
}
