-- CreateTable
CREATE TABLE "ProjectInvitation" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "FK_workspaceUserId" TEXT NOT NULL,
    "FK_projectId" TEXT NOT NULL,

    CONSTRAINT "ProjectInvitation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ProjectInvitation" ADD CONSTRAINT "ProjectInvitation_FK_workspaceUserId_fkey" FOREIGN KEY ("FK_workspaceUserId") REFERENCES "WorkspaceUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectInvitation" ADD CONSTRAINT "ProjectInvitation_FK_projectId_fkey" FOREIGN KEY ("FK_projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
