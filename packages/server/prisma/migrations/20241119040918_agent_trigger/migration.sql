-- CreateTable
CREATE TABLE "AgentTrigger" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "node" JSONB NOT NULL,
    "triggerId" TEXT NOT NULL,
    "FK_workflowId" TEXT,
    "FK_agentId" TEXT NOT NULL,

    CONSTRAINT "AgentTrigger_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AgentTrigger_FK_workflowId_key" ON "AgentTrigger"("FK_workflowId");

-- CreateIndex
CREATE UNIQUE INDEX "AgentTrigger_FK_agentId_key" ON "AgentTrigger"("FK_agentId");

-- AddForeignKey
ALTER TABLE "AgentTrigger" ADD CONSTRAINT "AgentTrigger_FK_workflowId_fkey" FOREIGN KEY ("FK_workflowId") REFERENCES "Workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentTrigger" ADD CONSTRAINT "AgentTrigger_FK_agentId_fkey" FOREIGN KEY ("FK_agentId") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
