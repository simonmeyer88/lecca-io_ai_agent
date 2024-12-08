/*
  Warnings:

  - You are about to drop the `WorkspaceLocation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WorkspaceLocationAddress` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "WorkspaceLocation" DROP CONSTRAINT "WorkspaceLocation_FK_workspaceId_fkey";

-- DropForeignKey
ALTER TABLE "WorkspaceLocationAddress" DROP CONSTRAINT "WorkspaceLocationAddress_FK_location_fkey";

-- DropTable
DROP TABLE "WorkspaceLocation";

-- DropTable
DROP TABLE "WorkspaceLocationAddress";

-- CreateTable
CREATE TABLE "Connection" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(255),
    "workflowAppId" TEXT NOT NULL,
    "FK_workspaceId" TEXT NOT NULL,
    "FK_projectId" TEXT,

    CONSTRAINT "Connection_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Connection" ADD CONSTRAINT "Connection_FK_workspaceId_fkey" FOREIGN KEY ("FK_workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Connection" ADD CONSTRAINT "Connection_FK_projectId_fkey" FOREIGN KEY ("FK_projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
