import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

import { ServerConfig } from '../../../config/server.config';

@Injectable()
export class CryptoService {
  private readonly algorithm = 'aes-256-cbc';
  private readonly key: Buffer;
  private readonly iv: Buffer;

  constructor() {
    const keyString = ServerConfig.CRYPTO_ENCRYPTION_KEY;
    if (!keyString || keyString.length !== 32) {
      throw new Error(
        'Invalid or missing CRYPTO_ENCRYPTION_KEY. The encryption key must be 32 characters long.',
      );
    }
    this.key = Buffer.from(keyString, 'utf-8');

    this.iv = crypto.randomBytes(16); // IV can be different for each encryption, stored along with the data
  }

  encrypt(text: string): string {
    const cipher = crypto.createCipheriv(this.algorithm, this.key, this.iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${this.iv.toString('hex')}:${encrypted}`;
  }

  decrypt(text: string): string {
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = textParts.join(':');
    const decipher = crypto.createDecipheriv(
      this.algorithm,
      this.key,
      Buffer.from(iv),
    );
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}
