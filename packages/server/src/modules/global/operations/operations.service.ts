import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';

import { ServerConfig } from '../../../config/server.config';

@Injectable()
export class OperationsService {
  constructor(private readonly httpService: HttpService) {}

  onNewUser({
    email,
    firstName,
    lastName,
    verifiedEmail,
  }: {
    email: string;
    firstName: string;
    lastName: string;
    verifiedEmail: boolean;
  }): void {
    if (ServerConfig.ENVIRONMENT === 'production') {
      const webhookUrl =
        'https://api.lecca.io/webhooks/workflows/e55ab91a-cf75-491d-804a-1f50ed91b081';
      const payload = {
        email,
        firstName,
        lastName,
        verifiedEmail,
      };

      this.#triggerWorkflow({ webhookUrl, payload });
    }
  }

  // Method to hit a custom webhook URL
  #triggerWorkflow({
    webhookUrl,
    payload,
  }: {
    webhookUrl: string;
    payload: any;
  }): void {
    try {
      this.httpService.post(webhookUrl, payload).subscribe({
        next: (response) => {
          console.info('Webhook triggered:', response.data);
        },
        error: (error) => {
          console.error('Error triggering webhook via webhook:', error);
        },
      });
    } catch (error) {
      console.error('Error when triggering workflow via webhook:', error);
    }
  }
}
