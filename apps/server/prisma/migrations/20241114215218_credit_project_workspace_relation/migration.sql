-- AlterTable
ALTER TABLE "Credit" ADD COLUMN     "FK_projectId" TEXT,
ADD COLUMN     "FK_workspace" TEXT;

-- AddForeignKey
ALTER TABLE "Credit" ADD CONSTRAINT "Credit_FK_workspace_fkey" FOREIGN KEY ("FK_workspace") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Credit" ADD CONSTRAINT "Credit_FK_projectId_fkey" FOREIGN KEY ("FK_projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
