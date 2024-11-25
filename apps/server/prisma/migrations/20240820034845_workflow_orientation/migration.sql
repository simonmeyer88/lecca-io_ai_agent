/*
  Warnings:

  - The `workflowOrientation` column on the `WorkspaceUserPreferences` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "WorkflowOrientation" AS ENUM ('HORIZONTAL', 'VERTICAL');

-- AlterTable
ALTER TABLE "Execution" ADD COLUMN     "output" JSONB;

-- AlterTable
ALTER TABLE "Workflow" ADD COLUMN     "workflowOrientation" "WorkflowOrientation" NOT NULL DEFAULT 'HORIZONTAL';

-- AlterTable
ALTER TABLE "WorkspaceUserPreferences" DROP COLUMN "workflowOrientation",
ADD COLUMN     "workflowOrientation" "WorkflowOrientation" NOT NULL DEFAULT 'HORIZONTAL';

-- DropEnum
DROP TYPE "WorkspaceUserWorkflowOrientation";
