/*
  Warnings:

  - You are about to drop the `_AgentReferences` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_AgentToKnowledge` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_AgentToVariable` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_AgentToWorkflow` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `updatedAt` to the `AgentAction` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_AgentReferences" DROP CONSTRAINT "_AgentReferences_A_fkey";

-- DropForeignKey
ALTER TABLE "_AgentReferences" DROP CONSTRAINT "_AgentReferences_B_fkey";

-- DropForeignKey
ALTER TABLE "_AgentToKnowledge" DROP CONSTRAINT "_AgentToKnowledge_A_fkey";

-- DropForeignKey
ALTER TABLE "_AgentToKnowledge" DROP CONSTRAINT "_AgentToKnowledge_B_fkey";

-- DropForeignKey
ALTER TABLE "_AgentToVariable" DROP CONSTRAINT "_AgentToVariable_A_fkey";

-- DropForeignKey
ALTER TABLE "_AgentToVariable" DROP CONSTRAINT "_AgentToVariable_B_fkey";

-- DropForeignKey
ALTER TABLE "_AgentToWorkflow" DROP CONSTRAINT "_AgentToWorkflow_A_fkey";

-- DropForeignKey
ALTER TABLE "_AgentToWorkflow" DROP CONSTRAINT "_AgentToWorkflow_B_fkey";

-- AlterTable
ALTER TABLE "AgentAction" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "_AgentReferences";

-- DropTable
DROP TABLE "_AgentToKnowledge";

-- DropTable
DROP TABLE "_AgentToVariable";

-- DropTable
DROP TABLE "_AgentToWorkflow";

-- CreateTable
CREATE TABLE "AgentKnowledge" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "FK_knowledgeId" TEXT NOT NULL,
    "FK_agentId" TEXT NOT NULL,

    CONSTRAINT "AgentKnowledge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentVariable" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "FK_variableId" TEXT NOT NULL,
    "FK_agentId" TEXT NOT NULL,

    CONSTRAINT "AgentVariable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentWorkflow" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "FK_workflowId" TEXT NOT NULL,
    "FK_agentId" TEXT NOT NULL,

    CONSTRAINT "AgentWorkflow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentSubAgent" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "FK_subAgentId" TEXT NOT NULL,
    "FK_agentId" TEXT NOT NULL,

    CONSTRAINT "AgentSubAgent_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AgentKnowledge" ADD CONSTRAINT "AgentKnowledge_FK_knowledgeId_fkey" FOREIGN KEY ("FK_knowledgeId") REFERENCES "Knowledge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentKnowledge" ADD CONSTRAINT "AgentKnowledge_FK_agentId_fkey" FOREIGN KEY ("FK_agentId") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentVariable" ADD CONSTRAINT "AgentVariable_FK_variableId_fkey" FOREIGN KEY ("FK_variableId") REFERENCES "Variable"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentVariable" ADD CONSTRAINT "AgentVariable_FK_agentId_fkey" FOREIGN KEY ("FK_agentId") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentWorkflow" ADD CONSTRAINT "AgentWorkflow_FK_workflowId_fkey" FOREIGN KEY ("FK_workflowId") REFERENCES "Workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentWorkflow" ADD CONSTRAINT "AgentWorkflow_FK_agentId_fkey" FOREIGN KEY ("FK_agentId") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentSubAgent" ADD CONSTRAINT "AgentSubAgent_FK_subAgentId_fkey" FOREIGN KEY ("FK_subAgentId") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentSubAgent" ADD CONSTRAINT "AgentSubAgent_FK_agentId_fkey" FOREIGN KEY ("FK_agentId") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
