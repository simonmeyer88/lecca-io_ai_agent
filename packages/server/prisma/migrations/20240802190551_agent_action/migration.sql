-- CreateTable
CREATE TABLE "AgentAction" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actionId" TEXT NOT NULL,
    "FK_agentId" TEXT NOT NULL,

    CONSTRAINT "AgentAction_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AgentAction" ADD CONSTRAINT "AgentAction_FK_agentId_fkey" FOREIGN KEY ("FK_agentId") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
