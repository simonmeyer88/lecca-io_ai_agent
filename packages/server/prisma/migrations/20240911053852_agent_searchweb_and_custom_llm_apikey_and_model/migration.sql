-- AlterTable
ALTER TABLE "Agent" ADD COLUMN     "canScrapeWebsites" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "canSearchWeb" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "llmApiKey" VARCHAR(255),
ADD COLUMN     "llmModel" TEXT;
