import { Action } from '@/apps/lib/action';
import { Connection } from '@/apps/lib/connection';
import { Trigger } from '@/apps/lib/trigger';
import {
  WorkflowApp,
  WorkflowAppConstructorArgs,
} from '@/apps/lib/workflow-app';
import { ServerConfig } from '@/config/server.config';

import { SearchKnowledge } from '../knowledge/actions/search-knowledge.action';

import { CreateKnowledge } from './actions/create-knowledge.action';
import { ListKnowledge } from './actions/list-knowledge.action';
import { SaveToKnowledge } from './actions/save-to-knowledge.action';

export class Knowledge extends WorkflowApp {
  constructor(args: WorkflowAppConstructorArgs) {
    super(args);
  }

  id = 'knowledge';
  name = 'Knowledge Notebooks';
  logoUrl = `${ServerConfig.INTEGRATION_ICON_BASE_URL}/apps/${this.id}.svg`;
  description =
    'Utilize knowledge notebooks to store and retrieve information.';
  isPublished =
    !!ServerConfig.PINECONE_API_KEY &&
    !!ServerConfig.PINECONE_API_KEY &&
    !!ServerConfig.OPENAI_EMBEDDING_API_KEY &&
    !!ServerConfig.S3_ACCESS_KEY_ID &&
    !!ServerConfig.S3_SECRET_ACCESS_KEY &&
    !!ServerConfig.S3_BUCKET_ID &&
    !!ServerConfig.S3_REGION;

  connections(): Connection[] {
    return [];
  }

  actions(): Action[] {
    return [
      new SearchKnowledge({ app: this }),
      new SaveToKnowledge({ app: this }),
      new ListKnowledge({ app: this }),
      new CreateKnowledge({ app: this }),
    ];
  }

  triggers(): Trigger[] {
    return [];
  }
}
