-- AlterTable
ALTER TABLE "Agent" ALTER COLUMN "llmModel" DROP DEFAULT,
ALTER COLUMN "llmProvider" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Knowledge" ALTER COLUMN "embeddingModel" DROP DEFAULT,
ALTER COLUMN "embeddingProvider" DROP DEFAULT;
