-- CreateTable
CREATE TABLE "RecentWorkflow" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "FK_workflowId" TEXT NOT NULL,
    "FK_workspaceUserId" TEXT NOT NULL,

    CONSTRAINT "RecentWorkflow_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RecentWorkflow" ADD CONSTRAINT "RecentWorkflow_FK_workflowId_fkey" FOREIGN KEY ("FK_workflowId") REFERENCES "Workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecentWorkflow" ADD CONSTRAINT "RecentWorkflow_FK_workspaceUserId_fkey" FOREIGN KEY ("FK_workspaceUserId") REFERENCES "WorkspaceUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
