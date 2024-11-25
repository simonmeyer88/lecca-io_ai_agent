/*
  Warnings:

  - You are about to drop the `ExecutionFileInput` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WorkflowFileInput` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ExecutionFileInput" DROP CONSTRAINT "ExecutionFileInput_FK_executionId_fkey";

-- DropForeignKey
ALTER TABLE "WorkflowFileInput" DROP CONSTRAINT "WorkflowFileInput_FK_workflowId_fkey";

-- DropTable
DROP TABLE "ExecutionFileInput";

-- DropTable
DROP TABLE "WorkflowFileInput";
