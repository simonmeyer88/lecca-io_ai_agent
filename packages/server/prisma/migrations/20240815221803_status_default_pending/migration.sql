-- AlterTable
ALTER TABLE "WorkspaceExecutionQueue" ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "WorkspaceExecutionQueueItem" ALTER COLUMN "status" SET DEFAULT 'PENDING';
