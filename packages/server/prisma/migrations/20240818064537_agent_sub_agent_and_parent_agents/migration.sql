-- CreateTable
CREATE TABLE "_AgentReferences" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_AgentReferences_AB_unique" ON "_AgentReferences"("A", "B");

-- CreateIndex
CREATE INDEX "_AgentReferences_B_index" ON "_AgentReferences"("B");

-- AddForeignKey
ALTER TABLE "_AgentReferences" ADD CONSTRAINT "_AgentReferences_A_fkey" FOREIGN KEY ("A") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AgentReferences" ADD CONSTRAINT "_AgentReferences_B_fkey" FOREIGN KEY ("B") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
