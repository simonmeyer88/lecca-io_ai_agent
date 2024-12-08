-- CreateTable
CREATE TABLE "_AgentToVariable" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_AgentToWorkflow" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_AgentToVariable_AB_unique" ON "_AgentToVariable"("A", "B");

-- CreateIndex
CREATE INDEX "_AgentToVariable_B_index" ON "_AgentToVariable"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_AgentToWorkflow_AB_unique" ON "_AgentToWorkflow"("A", "B");

-- CreateIndex
CREATE INDEX "_AgentToWorkflow_B_index" ON "_AgentToWorkflow"("B");

-- AddForeignKey
ALTER TABLE "_AgentToVariable" ADD CONSTRAINT "_AgentToVariable_A_fkey" FOREIGN KEY ("A") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AgentToVariable" ADD CONSTRAINT "_AgentToVariable_B_fkey" FOREIGN KEY ("B") REFERENCES "Variable"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AgentToWorkflow" ADD CONSTRAINT "_AgentToWorkflow_A_fkey" FOREIGN KEY ("A") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AgentToWorkflow" ADD CONSTRAINT "_AgentToWorkflow_B_fkey" FOREIGN KEY ("B") REFERENCES "Workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;
