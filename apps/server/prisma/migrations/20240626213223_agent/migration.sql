-- CreateTable
CREATE TABLE "Agent" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(255),
    "FK_projectId" TEXT NOT NULL,

    CONSTRAINT "Agent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_AgentToConnection" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_AgentToConnection_AB_unique" ON "_AgentToConnection"("A", "B");

-- CreateIndex
CREATE INDEX "_AgentToConnection_B_index" ON "_AgentToConnection"("B");

-- AddForeignKey
ALTER TABLE "Agent" ADD CONSTRAINT "Agent_FK_projectId_fkey" FOREIGN KEY ("FK_projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AgentToConnection" ADD CONSTRAINT "_AgentToConnection_A_fkey" FOREIGN KEY ("A") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AgentToConnection" ADD CONSTRAINT "_AgentToConnection_B_fkey" FOREIGN KEY ("B") REFERENCES "Connection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
