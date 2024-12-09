// packages/apps/index.ts
import { createApp } from '@lecca-io/toolkit';
import fs from 'fs';
import path from 'path';

/**
 * Add all exported apps below
 */
export * from './lib/slack/slack.app';

/**
 * Generates default export object of all apps
 */
const appFiles = fs.readdirSync(path.join(__dirname, 'lib'));
const apps: Record<string, ReturnType<typeof createApp>> = {};

appFiles.forEach((file) => {
  const app = require(`./lib/${file}`);
  apps[app.id] = app;
});

export default apps;
