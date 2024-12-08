-- CreateEnum
CREATE TYPE "TaskMessageRole" AS ENUM ('system', 'user', 'assistant', 'function', 'data', 'tool');

-- CreateTable
CREATE TABLE "TaskMessage" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "content" TEXT NOT NULL,
    "role" "TaskMessageRole" NOT NULL,
    "data" JSONB,
    "toolInvocation" JSONB,
    "FK_taskId" TEXT NOT NULL,

    CONSTRAINT "TaskMessage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TaskMessage" ADD CONSTRAINT "TaskMessage_FK_taskId_fkey" FOREIGN KEY ("FK_taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;
