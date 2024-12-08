-- CreateEnum
CREATE TYPE "WebAccessService" AS ENUM ('apify');

-- CreateTable
CREATE TABLE "AgentWebAccess" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "service" "WebAccessService" NOT NULL DEFAULT 'apify',
    "FK_agentId" TEXT NOT NULL,

    CONSTRAINT "AgentWebAccess_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AgentWebAccess_FK_agentId_key" ON "AgentWebAccess"("FK_agentId");

-- AddForeignKey
ALTER TABLE "AgentWebAccess" ADD CONSTRAINT "AgentWebAccess_FK_agentId_fkey" FOREIGN KEY ("FK_agentId") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
