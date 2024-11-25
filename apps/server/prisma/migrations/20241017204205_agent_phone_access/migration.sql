-- CreateEnum
CREATE TYPE "PhoneAccessService" AS ENUM ('vapi');

-- CreateTable
CREATE TABLE "AgentPhoneAccess" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "service" "PhoneAccessService" NOT NULL DEFAULT 'vapi',
    "outboundCallsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "inboundCallsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "FK_agentId" TEXT NOT NULL,

    CONSTRAINT "AgentPhoneAccess_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AgentPhoneAccess_FK_agentId_key" ON "AgentPhoneAccess"("FK_agentId");

-- AddForeignKey
ALTER TABLE "AgentPhoneAccess" ADD CONSTRAINT "AgentPhoneAccess_FK_agentId_fkey" FOREIGN KEY ("FK_agentId") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
