import { Injectable } from '@nestjs/common';
import {
  Pinecone,
  QueryOptions,
  QueryResponse,
} from '@pinecone-database/pinecone';

import { ServerConfig } from '../../../config/server.config';

@Injectable()
export class PineconeService {
  constructor() {
    const pineconeApiKey = ServerConfig.PINECONE_API_KEY;

    if (!pineconeApiKey) {
      //Cannot use Pinecone without the required environment variables
    } else {
      this.pinecone = new Pinecone({
        apiKey: pineconeApiKey,
      });
    }
  }

  pinecone: Pinecone;

  upsert = async ({
    newVectorId,
    embedding,
    indexName,
    workspaceId,
    knowledgeId,
    projectId,
    s3Link,
  }: {
    newVectorId: string;
    embedding: number[];
    indexName: string;
    workspaceId: string;
    knowledgeId: string;
    projectId?: string;

    /**
     * If upserting to an s3 link
     */
    s3Link?: string;
  }) => {
    const metadata: PineconeMetadata = {
      knowledgeId,
    };

    if (projectId) {
      metadata.projectId = projectId;
    }

    if (s3Link) {
      metadata.s3Link = s3Link;
    }

    return await this.pinecone
      .index(indexName)
      .namespace(workspaceId)
      .upsert([
        {
          id: newVectorId,
          values: embedding,
          metadata,
        },
      ]);
  };

  query = async ({
    indexName,
    workspaceId,
    knowledgeId,
    projectId,
    queryEmbedding,
    limit,
  }: {
    indexName: string;
    workspaceId: string;
    knowledgeId: string;
    projectId: string | undefined;
    queryEmbedding: number[];
    limit?: number;
  }): Promise<QueryResponse<PineconeMetadata>> => {
    const query: QueryOptions = {
      vector: queryEmbedding,
      topK: limit ?? 3,
      includeMetadata: true,
    };

    if (projectId) {
      query.filter = {
        projectId: { $eq: projectId },
        knowledgeId: { $eq: knowledgeId },
      };
    } else {
      query.filter = {
        knowledgeId: { $eq: knowledgeId },
      };
    }

    const queryResponse = await this.pinecone
      .index(indexName)
      .namespace(workspaceId)
      .query(query);

    return queryResponse as QueryResponse<PineconeMetadata>;
  };

  queryById = async ({
    indexName,
    workspaceId,
    vectorRefId,
  }: {
    indexName: string;
    workspaceId: string;
    knowledgeId: string;
    vectorRefId: string;
  }): Promise<QueryResponse<PineconeMetadata>> => {
    const query: QueryOptions = {
      id: vectorRefId,
      topK: 1,
      includeMetadata: true,
    };

    const queryResponse = await this.pinecone
      .index(indexName)
      .namespace(workspaceId)
      .query(query);

    return queryResponse as QueryResponse<PineconeMetadata>;
  };

  deleteMany = async ({
    indexName,
    workspaceId,
    idsToDelete,
  }: {
    indexName: string;
    workspaceId: string;
    idsToDelete: string[];
  }) => {
    try {
      return await this.pinecone
        .index(indexName)
        .namespace(workspaceId)
        .deleteMany(idsToDelete);
    } catch {
      //This will error if it doesn't exist, which is fine.
    }
  };
}

export type PineconeMetadata = {
  /**
   * Always required. Used to reference knowledge in the database
   */
  knowledgeId: string;

  /**
   * This is knowledge within a project, not just the workspace
   */
  projectId?: string;

  /**
   * This is knowledge that references a file in s3
   * If this property exists, we return the s3 link as the result.
   */
  s3Link?: string;
};
