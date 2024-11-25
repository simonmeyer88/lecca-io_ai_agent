-- CreateEnum
CREATE TYPE "WorkflowStrategy" AS ENUM ('manual', 'poll', 'schedule', 'webhook');

-- AlterTable
ALTER TABLE "Workflow" ADD COLUMN     "strategy" "WorkflowStrategy";
