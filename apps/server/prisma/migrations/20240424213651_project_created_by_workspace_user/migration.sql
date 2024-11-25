-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "FK_createdByWorkspaceUserId" TEXT;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_FK_createdByWorkspaceUserId_fkey" FOREIGN KEY ("FK_createdByWorkspaceUserId") REFERENCES "WorkspaceUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
