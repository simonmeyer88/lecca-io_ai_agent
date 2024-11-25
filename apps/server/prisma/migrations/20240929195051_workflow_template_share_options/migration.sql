-- CreateEnum
CREATE TYPE "SharedToOptions" AS ENUM ('project', 'workspace', 'global');

-- AlterTable
ALTER TABLE "WorkflowTemplate" ADD COLUMN     "sharedTo" "SharedToOptions" NOT NULL DEFAULT 'project';
