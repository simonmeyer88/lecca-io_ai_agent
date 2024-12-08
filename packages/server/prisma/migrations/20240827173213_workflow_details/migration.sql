/*
  Warnings:

  - You are about to drop the column `appIds` on the `Workflow` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Workflow" DROP COLUMN "appIds",
ADD COLUMN     "agentIds" TEXT[],
ADD COLUMN     "subWorkflowIds" TEXT[],
ADD COLUMN     "triggerAndActionIds" TEXT[];
