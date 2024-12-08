-- AlterTable
ALTER TABLE "Agent" ADD COLUMN     "appIds" TEXT[];

-- AlterTable
ALTER TABLE "Workflow" ADD COLUMN     "appsIds" TEXT[];
