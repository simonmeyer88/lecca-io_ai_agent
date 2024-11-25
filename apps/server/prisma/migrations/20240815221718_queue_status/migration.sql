/*
  Warnings:

  - Added the required column `status` to the `WorkspaceExecutionQueue` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "WorkspaceExecutionQueue" ADD COLUMN     "status" "WorkspaceExecutionQueueStatus" NOT NULL;
