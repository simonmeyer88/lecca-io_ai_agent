import { Action } from '@/apps/lib/action';
import { App } from '@/apps/lib/app';
import { Connection } from '@/apps/lib/connection';
import { Trigger } from '@/apps/lib/trigger';
import { ServerConfig } from '@/config/server.config';

import { ExtractStaticWebsiteContent } from './actions/extract-static-website-content.action';
import { ExtractWebsiteContent } from './actions/extract-website-content.action';
import { GoogleSearch } from './actions/google-search.action';

export class Web extends App {
  id = 'web';
  name = 'Web';
  logoUrl = `${ServerConfig.INTEGRATION_ICON_BASE_URL}/apps/${this.id}.svg`;
  description = `Access the web using pre-built actions by ${ServerConfig.PLATFORM_NAME}`;
  isPublished = !!(
    (ServerConfig.APIFY_API_KEY &&
      (ServerConfig.APIFY_EXTRACT_DYNAMIC_CONTENT_TASK_ID ||
        ServerConfig.APIFY_EXTRACT_STATIC_CONTENT_TASK_ID)) ||
    ServerConfig.SERPER_API_KEY
  );
  needsConnection = false;

  connections(): Connection[] {
    return [];
  }

  actions(): Action[] {
    return [
      ServerConfig.APIFY_API_KEY &&
      ServerConfig.APIFY_EXTRACT_DYNAMIC_CONTENT_TASK_ID
        ? new ExtractWebsiteContent({
            app: this,
          })
        : null,
      ServerConfig.APIFY_API_KEY &&
      ServerConfig.APIFY_EXTRACT_STATIC_CONTENT_TASK_ID
        ? new ExtractStaticWebsiteContent({
            app: this,
          })
        : null,
      ServerConfig.SERPER_API_KEY
        ? new GoogleSearch({
            app: this,
          })
        : null,
    ].filter(Boolean);
  }

  triggers(): Trigger[] {
    return [];
  }
}
