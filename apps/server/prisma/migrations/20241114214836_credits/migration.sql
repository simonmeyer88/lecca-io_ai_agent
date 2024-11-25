/*
  Warnings:

  - You are about to drop the column `FK_defaultWorkspaceLlmConnection` on the `Connection` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Connection" DROP CONSTRAINT "Connection_FK_defaultWorkspaceLlmConnection_fkey";

-- DropIndex
DROP INDEX "Connection_FK_defaultWorkspaceLlmConnection_key";

-- AlterTable
ALTER TABLE "Connection" DROP COLUMN "FK_defaultWorkspaceLlmConnection";

-- CreateTable
CREATE TABLE "Credit" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "creditsUsed" INTEGER NOT NULL,
    "metadata" JSONB NOT NULL,
    "FK_workflowId" TEXT,
    "FK_agentId" TEXT,
    "FK_taskId" TEXT,
    "FK_executionId" TEXT,

    CONSTRAINT "Credit_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Credit" ADD CONSTRAINT "Credit_FK_workflowId_fkey" FOREIGN KEY ("FK_workflowId") REFERENCES "Workflow"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Credit" ADD CONSTRAINT "Credit_FK_agentId_fkey" FOREIGN KEY ("FK_agentId") REFERENCES "Agent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Credit" ADD CONSTRAINT "Credit_FK_taskId_fkey" FOREIGN KEY ("FK_taskId") REFERENCES "Task"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Credit" ADD CONSTRAINT "Credit_FK_executionId_fkey" FOREIGN KEY ("FK_executionId") REFERENCES "Execution"("id") ON DELETE SET NULL ON UPDATE CASCADE;
