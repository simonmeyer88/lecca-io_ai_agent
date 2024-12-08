/*
  Warnings:

  - You are about to drop the column `FK_workspace` on the `Credit` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Credit" DROP CONSTRAINT "Credit_FK_workspace_fkey";

-- AlterTable
ALTER TABLE "Credit" DROP COLUMN "FK_workspace",
ADD COLUMN     "FK_workspaceId" TEXT;

-- AddForeignKey
ALTER TABLE "Credit" ADD CONSTRAINT "Credit_FK_workspaceId_fkey" FOREIGN KEY ("FK_workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
