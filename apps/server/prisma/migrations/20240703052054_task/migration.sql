-- CreateEnum
CREATE TYPE "TaskMessageType" AS ENUM ('ASSISTANT', 'TOOL', 'USER');

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(255),
    "FK_agentId" TEXT NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskMessage" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" "TaskMessageType" NOT NULL,
    "content" JSONB NOT NULL,
    "toolDetails" JSONB,
    "FK_taskId" TEXT NOT NULL,

    CONSTRAINT "TaskMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskMessageUsage" (
    "id" TEXT NOT NULL,
    "promptTokens" INTEGER NOT NULL,
    "completionTokens" INTEGER NOT NULL,
    "FK_taskMessageId" TEXT NOT NULL,

    CONSTRAINT "TaskMessageUsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TaskMessageUsage_FK_taskMessageId_key" ON "TaskMessageUsage"("FK_taskMessageId");

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_FK_agentId_fkey" FOREIGN KEY ("FK_agentId") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskMessage" ADD CONSTRAINT "TaskMessage_FK_taskId_fkey" FOREIGN KEY ("FK_taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskMessageUsage" ADD CONSTRAINT "TaskMessageUsage_FK_taskMessageId_fkey" FOREIGN KEY ("FK_taskMessageId") REFERENCES "TaskMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
