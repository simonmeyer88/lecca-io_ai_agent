-- AlterTable
ALTER TABLE "Workspace" ADD COLUMN     "FK_createdByWorkspaceUserId" TEXT;

-- AddForeignKey
ALTER TABLE "Workspace" ADD CONSTRAINT "Workspace_FK_createdByWorkspaceUserId_fkey" FOREIGN KEY ("FK_createdByWorkspaceUserId") REFERENCES "WorkspaceUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
