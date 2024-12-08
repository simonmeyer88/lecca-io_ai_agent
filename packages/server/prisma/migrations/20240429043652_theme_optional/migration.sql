-- AlterTable
ALTER TABLE "Workflow" ALTER COLUMN "isActive" SET DEFAULT true;

-- AlterTable
ALTER TABLE "WorkspaceUserPreferences" ALTER COLUMN "theme" DROP NOT NULL,
ALTER COLUMN "theme" DROP DEFAULT;
