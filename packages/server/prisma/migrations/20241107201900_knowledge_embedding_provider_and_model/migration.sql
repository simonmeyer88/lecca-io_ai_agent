-- AlterTable
ALTER TABLE "Knowledge" ADD COLUMN     "embeddingModel" TEXT NOT NULL DEFAULT 'text-embedding-ada-002',
ADD COLUMN     "embeddingProvider" TEXT NOT NULL DEFAULT 'openai';
