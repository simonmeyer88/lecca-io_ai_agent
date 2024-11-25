import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { AbstractHttpAdapter } from '@nestjs/core';
import { Prisma } from '@prisma/client';
import { PrismaClientValidationError } from '@prisma/client/runtime/library';

@Catch(Prisma.PrismaClientKnownRequestError, PrismaClientValidationError)
export class PrismaClientExceptionFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: AbstractHttpAdapter) {}

  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    let errorMessage: string;
    let httpStatus: number;
    const httpAdapter = this.httpAdapterHost;
    const ctx = host.switchToHttp();

    console.error(exception.message);

    if (exception instanceof PrismaClientValidationError) {
      /**
       * The idea is to never get here because we always validate data in the controllers
       */
      httpStatus = HttpStatus.BAD_REQUEST;
      errorMessage = 'Invalid data';
    } else {
      /**
       * Eventually it would be nice to pass in a entity name to make the error messages more specific.
       * Then we would have to set this filter on each controller class an override the constructor
       * instead of setting it globally.
       */
      switch (exception.code) {
        case 'P2002':
          httpStatus = HttpStatus.CONFLICT;
          errorMessage = 'Already exists';
          break;
        case 'P2025':
          /**
           * This error only happens if we're trying to update or delete a record.
           * It won't happen if you try to retrieve by id and the record doesn't exist.
           */
          httpStatus = HttpStatus.NOT_FOUND;
          errorMessage = 'Not found';
          break;
        default:
          httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
          errorMessage = 'Something went wrong';
          break;
      }
    }

    const errorResponse = {
      statusCode: httpStatus,
      message: errorMessage,
    };

    httpAdapter.reply(ctx.getResponse(), errorResponse, httpStatus);
  }
}
