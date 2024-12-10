import { Controller, Get, Param, Post, Put, Req, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';

import { Public } from '@/decorators/public.decorator';
import { StripeService } from '@/modules/commercial/stripe/stripe.service';

import { WebhookService } from './webhook.service';

@Controller('webhooks')
@ApiTags('Webhooks')
@Public()
export class WebhookController {
  constructor(
    private readonly webhookService: WebhookService,
    private readonly stripeService: StripeService,
  ) {}

  /**
   * This isn't used for workflows. The is the actual stripe webhook endpoint
   * that our platform uses to receive stripe events.
   */
  @Post('stripe')
  async stripeEvent(@Req() req: Request, @Res() res: Response) {
    //1. Verify the signature and return the event
    const stripeEvent = this.stripeService.verifySignatureAndReturnEvent(req);

    //2. Return a 200 status code to stripe to avoid retries
    res.status(200).send();

    //3. Handle the stripe event
    return await this.stripeService.handleStripeEvent(stripeEvent);
  }

  /**
   * Used to trigger a workflow execution using an app integration webhook trigger
   */
  @Post('apps/:appId')
  async appEvent(
    @Param('appId') appId: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    //This is returning the body to satisfy the webhook challenge (for slack, .etc)
    //We also need to immediately return a 200 status code to the webhook provider
    //to avoid retries and any other issues.
    res.status(200).json(req.body);

    try {
      const rawBody = (req as any)['parsedRawBody']?.toString();
      const { headers } = req as any;

      await this.webhookService.handleAppWebhookEvent({
        appId,
        rawBody: rawBody,
        headers: headers as Record<string, string>,
      });
    } catch (err) {
      console.error('Error handling app event:', err.message);
    }
  }

  /**
   * Used to trigger a workflow execution using a custom webhook trigger
   */
  @Post('workflows/:workflowId')
  async workflowEventPOST(
    @Param('workflowId') workflowId: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const response = await this.webhookService.handleWorkflowWebhookEvent({
        workflowId,
        body: { body: req.body, headers: req.headers },
      });

      res.status(200).json(response?.output);

      await this.webhookService.updateWorkflowPollStorageWithWebhookData({
        workflowId,
        body: { body: req.body, headers: req.headers },
      });
    } catch (err) {
      console.error('Error handling workflow event:', err.message);
    }
  }

  /**
   * Used to trigger a workflow execution using a custom webhook trigger
   */
  @Put('workflows/:workflowId')
  async workflowEventPUT(
    @Param('workflowId') workflowId: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const response = await this.webhookService.handleWorkflowWebhookEvent({
        workflowId,
        body: { body: req.body, headers: req.headers },
      });

      res.status(200).json(response?.output);

      await this.webhookService.updateWorkflowPollStorageWithWebhookData({
        workflowId,
        body: { body: req.body, headers: req.headers },
      });
    } catch (err) {
      console.error('Error handling workflow event:', err.message);
    }
  }

  /**
   * Used to trigger a workflow execution using a custom webhook trigger
   */
  @Get('workflows/:workflowId')
  async workflowEventGet(
    @Param('workflowId') workflowId: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      //Extract the query params from the request and add them to the body
      let bodyFromQueryParams = {};

      if (req.query) {
        bodyFromQueryParams = Object.fromEntries(
          Object.entries(req.query).map(([key, value]) => {
            return [key, value];
          }),
        );
      }

      if (req.headers) {
        bodyFromQueryParams = {
          queryParams: bodyFromQueryParams,
          headers: req.headers,
        };
      }

      const response = await this.webhookService.handleWorkflowWebhookEvent({
        workflowId,
        body: bodyFromQueryParams,
      });

      res.status(200).json(response?.output);

      await this.webhookService.updateWorkflowPollStorageWithWebhookData({
        workflowId,
        body: bodyFromQueryParams,
      });
    } catch (err) {
      console.error('Error handling workflow event:', err.message);
    }
  }

  @Post('executions/:executionId/nodes/:nodeId/input')
  async executionStepEventPOST(
    @Param('executionId') executionId: string,
    @Param('nodeId') nodeId: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    //Immediately return response. This isn't necessary for this endpoint, but it's what we do for all webhooks
    res.sendStatus(200);

    return await this.webhookService.handleExecutionWebhookEvent({
      executionId,
      nodeId,
      data: req.body,
    });
  }
}
