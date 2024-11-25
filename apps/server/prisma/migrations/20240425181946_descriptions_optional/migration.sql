/*
  Warnings:

  - Made the column `FK_workspaceId` on table `Variable` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Project" ALTER COLUMN "description" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Variable" ALTER COLUMN "description" DROP NOT NULL,
ALTER COLUMN "FK_workspaceId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Workflow" ALTER COLUMN "description" DROP NOT NULL;

-- AlterTable
ALTER TABLE "WorkflowAppConnection" ALTER COLUMN "description" DROP NOT NULL;

-- AlterTable
ALTER TABLE "WorkflowNode" ALTER COLUMN "description" DROP NOT NULL;
