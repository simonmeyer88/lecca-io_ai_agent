-- AlterTable
ALTER TABLE "AgentAction" ALTER COLUMN "updatedAt" DROP NOT NULL;

-- AlterTable
ALTER TABLE "AgentKnowledge" ALTER COLUMN "updatedAt" DROP NOT NULL;

-- AlterTable
ALTER TABLE "AgentSubAgent" ALTER COLUMN "updatedAt" DROP NOT NULL;

-- AlterTable
ALTER TABLE "AgentVariable" ALTER COLUMN "updatedAt" DROP NOT NULL;

-- AlterTable
ALTER TABLE "AgentWorkflow" ALTER COLUMN "updatedAt" DROP NOT NULL;
