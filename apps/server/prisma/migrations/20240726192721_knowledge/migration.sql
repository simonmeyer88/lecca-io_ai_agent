-- CreateTable
CREATE TABLE "Knowledge" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(255),
    "indexName" TEXT NOT NULL DEFAULT '1-lecca-io-us-east-2',
    "FK_workspaceId" TEXT NOT NULL,
    "FK_projectId" TEXT,

    CONSTRAINT "Knowledge_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Knowledge" ADD CONSTRAINT "Knowledge_FK_workspaceId_fkey" FOREIGN KEY ("FK_workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Knowledge" ADD CONSTRAINT "Knowledge_FK_projectId_fkey" FOREIGN KEY ("FK_projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
