-- CreateTable
CREATE TABLE "WorkflowFileInput" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" VARCHAR(100) NOT NULL,
    "s3Link" TEXT,
    "type" TEXT,
    "fileSize" INTEGER,
    "FK_workflowId" TEXT NOT NULL,

    CONSTRAINT "WorkflowFileInput_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExecutionFileInput" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" VARCHAR(100) NOT NULL,
    "s3Link" TEXT,
    "type" TEXT,
    "fileSize" INTEGER,
    "FK_executionId" TEXT NOT NULL,

    CONSTRAINT "ExecutionFileInput_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "WorkflowFileInput" ADD CONSTRAINT "WorkflowFileInput_FK_workflowId_fkey" FOREIGN KEY ("FK_workflowId") REFERENCES "Workflow"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExecutionFileInput" ADD CONSTRAINT "ExecutionFileInput_FK_executionId_fkey" FOREIGN KEY ("FK_executionId") REFERENCES "Execution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
