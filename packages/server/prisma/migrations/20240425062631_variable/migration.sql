-- CreateEnum
CREATE TYPE "VariableType" AS ENUM ('system', 'workspace');

-- CreateEnum
CREATE TYPE "VariableVariableType" AS ENUM ('string', 'number', 'boolean', 'date', 'json');

-- CreateTable
CREATE TABLE "Variable" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(255) NOT NULL,
    "type" "VariableType" NOT NULL,
    "dataType" "VariableVariableType" NOT NULL,
    "value" JSONB NOT NULL,
    "FK_workspaceId" TEXT,
    "FK_projectId" TEXT,

    CONSTRAINT "Variable_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Variable" ADD CONSTRAINT "Variable_FK_workspaceId_fkey" FOREIGN KEY ("FK_workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Variable" ADD CONSTRAINT "Variable_FK_projectId_fkey" FOREIGN KEY ("FK_projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
