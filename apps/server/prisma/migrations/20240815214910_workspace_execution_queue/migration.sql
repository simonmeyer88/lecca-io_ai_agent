-- CreateEnum
CREATE TYPE "WorkspaceExecutionQueueStatus" AS ENUM ('PENDING', 'RUNNING');

-- CreateTable
CREATE TABLE "WorkspaceExecutionQueue" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "FK_workspaceId" TEXT NOT NULL,

    CONSTRAINT "WorkspaceExecutionQueue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkspaceExecutionQueueItem" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "WorkspaceExecutionQueueStatus" NOT NULL,
    "FK_workspaceExecutionQueueId" TEXT NOT NULL,
    "FK_executionId" TEXT NOT NULL,

    CONSTRAINT "WorkspaceExecutionQueueItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WorkspaceExecutionQueue_FK_workspaceId_key" ON "WorkspaceExecutionQueue"("FK_workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkspaceExecutionQueueItem_FK_executionId_key" ON "WorkspaceExecutionQueueItem"("FK_executionId");

-- AddForeignKey
ALTER TABLE "WorkspaceExecutionQueue" ADD CONSTRAINT "WorkspaceExecutionQueue_FK_workspaceId_fkey" FOREIGN KEY ("FK_workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceExecutionQueueItem" ADD CONSTRAINT "WorkspaceExecutionQueueItem_FK_workspaceExecutionQueueId_fkey" FOREIGN KEY ("FK_workspaceExecutionQueueId") REFERENCES "WorkspaceExecutionQueue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceExecutionQueueItem" ADD CONSTRAINT "WorkspaceExecutionQueueItem_FK_executionId_fkey" FOREIGN KEY ("FK_executionId") REFERENCES "Execution"("id") ON DELETE CASCADE ON UPDATE CASCADE;
