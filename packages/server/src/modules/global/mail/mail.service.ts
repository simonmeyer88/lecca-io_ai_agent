import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

import { ServerConfig } from '../../../config/server.config';

@Injectable()
export class MailService {
  constructor() {
    const MAIL_FROM_EMAIL_ADDRESS =
      ServerConfig.MAIL_OPTIONS.MAIL_FROM_EMAIL_ADDRESS;
    const MAIL_FROM_NAME = ServerConfig.MAIL_OPTIONS.MAIL_FROM_NAME;
    const MAIL_CLIENT_ID = ServerConfig.MAIL_OPTIONS.MAIL_CLIENT_ID;
    const MAIL_CLIENT_SECRET = ServerConfig.MAIL_OPTIONS.MAIL_CLIENT_SECRET;
    const MAIL_REFRESH_TOKEN = ServerConfig.MAIL_OPTIONS.MAIL_REFRESH_TOKEN;

    if (
      !MAIL_FROM_EMAIL_ADDRESS ||
      !MAIL_FROM_NAME ||
      !MAIL_CLIENT_ID ||
      !MAIL_CLIENT_SECRET ||
      !MAIL_REFRESH_TOKEN
    ) {
      this.#isEnabled = false;
    } else {
      this.#transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          type: 'OAuth2',
          user: ServerConfig.MAIL_OPTIONS.MAIL_FROM_EMAIL_ADDRESS,
          clientId: ServerConfig.MAIL_OPTIONS.MAIL_CLIENT_ID,
          clientSecret: ServerConfig.MAIL_OPTIONS.MAIL_CLIENT_SECRET,
          refreshToken: ServerConfig.MAIL_OPTIONS.MAIL_REFRESH_TOKEN,
        },
      });
      this.#isEnabled = true;
    }
  }

  #transporter: nodemailer.Transporter;
  #isEnabled: boolean;

  async sendMail({
    to,
    subject,
    text,
    html,
  }: {
    to: string;
    subject: string;
    text: string;
    html: string;
  }) {
    if (!this.#isEnabled) {
      return;
    }

    const mailOptions = {
      from: {
        name: ServerConfig.MAIL_OPTIONS.MAIL_FROM_NAME,
        address: ServerConfig.MAIL_OPTIONS.MAIL_FROM_EMAIL_ADDRESS,
      },
      to: to,
      subject: subject,
      text: text,
      html: html,
    };

    return await this.#transporter.sendMail(mailOptions);
  }
}
