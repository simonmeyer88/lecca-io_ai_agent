-- CreateEnum
CREATE TYPE "WorkspaceUserWorkflowOrientation" AS ENUM ('HORIZONTAL', 'VERTICAL');

-- AlterTable
ALTER TABLE "WorkspaceUserPreferences" ADD COLUMN     "workflowOrientation" "WorkspaceUserWorkflowOrientation" NOT NULL DEFAULT 'HORIZONTAL';
