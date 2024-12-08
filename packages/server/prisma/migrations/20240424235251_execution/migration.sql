-- CreateEnum
CREATE TYPE "ExecutionStatus" AS ENUM ('PENDING', 'RUNNING');

-- CreateTable
CREATE TABLE "Execution" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "stoppedAt" TIMESTAMP(3),
    "status" "ExecutionStatus" NOT NULL,
    "executionNumber" INTEGER NOT NULL,
    "FK_workflowId" TEXT NOT NULL,

    CONSTRAINT "Execution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_WorkflowToWorkspaceUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_WorkflowToWorkspaceUser_AB_unique" ON "_WorkflowToWorkspaceUser"("A", "B");

-- CreateIndex
CREATE INDEX "_WorkflowToWorkspaceUser_B_index" ON "_WorkflowToWorkspaceUser"("B");

-- AddForeignKey
ALTER TABLE "Execution" ADD CONSTRAINT "Execution_FK_workflowId_fkey" FOREIGN KEY ("FK_workflowId") REFERENCES "Workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_WorkflowToWorkspaceUser" ADD CONSTRAINT "_WorkflowToWorkspaceUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_WorkflowToWorkspaceUser" ADD CONSTRAINT "_WorkflowToWorkspaceUser_B_fkey" FOREIGN KEY ("B") REFERENCES "WorkspaceUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
