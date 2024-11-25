/*
  Warnings:

  - You are about to drop the column `llmApiKey` on the `Agent` table. All the data in the column will be lost.
  - You are about to drop the `_AgentToConnection` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[FK_defaultWorkspaceLlmConnection]` on the table `Connection` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "_AgentToConnection" DROP CONSTRAINT "_AgentToConnection_A_fkey";

-- DropForeignKey
ALTER TABLE "_AgentToConnection" DROP CONSTRAINT "_AgentToConnection_B_fkey";

-- AlterTable
ALTER TABLE "Agent" DROP COLUMN "llmApiKey",
ADD COLUMN     "FK_llmConnectionId" TEXT;

-- AlterTable
ALTER TABLE "Connection" ADD COLUMN     "FK_defaultWorkspaceLlmConnection" TEXT;

-- DropTable
DROP TABLE "_AgentToConnection";

-- CreateTable
CREATE TABLE "_AgentConnections" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_AgentConnections_AB_unique" ON "_AgentConnections"("A", "B");

-- CreateIndex
CREATE INDEX "_AgentConnections_B_index" ON "_AgentConnections"("B");

-- CreateIndex
CREATE UNIQUE INDEX "Connection_FK_defaultWorkspaceLlmConnection_key" ON "Connection"("FK_defaultWorkspaceLlmConnection");

-- AddForeignKey
ALTER TABLE "Agent" ADD CONSTRAINT "Agent_FK_llmConnectionId_fkey" FOREIGN KEY ("FK_llmConnectionId") REFERENCES "Connection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Connection" ADD CONSTRAINT "Connection_FK_defaultWorkspaceLlmConnection_fkey" FOREIGN KEY ("FK_defaultWorkspaceLlmConnection") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AgentConnections" ADD CONSTRAINT "_AgentConnections_A_fkey" FOREIGN KEY ("A") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AgentConnections" ADD CONSTRAINT "_AgentConnections_B_fkey" FOREIGN KEY ("B") REFERENCES "Connection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
