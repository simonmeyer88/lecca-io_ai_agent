/*
  Warnings:

  - You are about to drop the column `agentId` on the `Knowledge` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Knowledge" DROP CONSTRAINT "Knowledge_agentId_fkey";

-- AlterTable
ALTER TABLE "Knowledge" DROP COLUMN "agentId";

-- CreateTable
CREATE TABLE "_AgentToKnowledge" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_AgentToKnowledge_AB_unique" ON "_AgentToKnowledge"("A", "B");

-- CreateIndex
CREATE INDEX "_AgentToKnowledge_B_index" ON "_AgentToKnowledge"("B");

-- AddForeignKey
ALTER TABLE "_AgentToKnowledge" ADD CONSTRAINT "_AgentToKnowledge_A_fkey" FOREIGN KEY ("A") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AgentToKnowledge" ADD CONSTRAINT "_AgentToKnowledge_B_fkey" FOREIGN KEY ("B") REFERENCES "Knowledge"("id") ON DELETE CASCADE ON UPDATE CASCADE;
