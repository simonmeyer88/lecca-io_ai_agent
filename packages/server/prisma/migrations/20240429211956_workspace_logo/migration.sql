-- AlterTable
ALTER TABLE "Workspace" ADD COLUMN     "logoUrl" TEXT;

-- AlterTable
ALTER TABLE "WorkspaceUser" ALTER COLUMN "profileImageUrl" SET DATA TYPE TEXT;
