-- AlterTable
ALTER TABLE "Agent" ALTER COLUMN "description" SET DATA TYPE VARCHAR(1000),
ALTER COLUMN "instructions" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Connection" ALTER COLUMN "description" SET DATA TYPE VARCHAR(1000);

-- AlterTable
ALTER TABLE "Knowledge" ALTER COLUMN "description" SET DATA TYPE VARCHAR(1000);

-- AlterTable
ALTER TABLE "Project" ALTER COLUMN "description" SET DATA TYPE VARCHAR(1000);

-- AlterTable
ALTER TABLE "Variable" ALTER COLUMN "description" SET DATA TYPE VARCHAR(1000);

-- AlterTable
ALTER TABLE "Workflow" ALTER COLUMN "description" SET DATA TYPE VARCHAR(1000);

-- AlterTable
ALTER TABLE "WorkflowAppConnection" ALTER COLUMN "description" SET DATA TYPE VARCHAR(1000);

-- AlterTable
ALTER TABLE "WorkflowTemplate" ALTER COLUMN "description" SET DATA TYPE VARCHAR(1000);
