-- CreateEnum
CREATE TYPE "WorkflowNodeType" AS ENUM ('action', 'trigger');

-- CreateEnum
CREATE TYPE "WorkflowEdgeType" AS ENUM ('placeholder', 'workflow');

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_FK_workspaceUserId_fkey";

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(255) NOT NULL,
    "FK_workspaceId" TEXT NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Workflow" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(255) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "FK_projectId" TEXT NOT NULL,

    CONSTRAINT "Workflow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkflowNode" (
    "id" TEXT NOT NULL,
    "position" JSONB NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(255) NOT NULL,
    "nodeType" "WorkflowNodeType" NOT NULL,
    "actionId" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "raw" JSONB NOT NULL,
    "FK_workflowAppId" TEXT NOT NULL,
    "FK_workflowId" TEXT NOT NULL,

    CONSTRAINT "WorkflowNode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkflowEdge" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "type" "WorkflowEdgeType" NOT NULL,
    "FK_workflowId" TEXT NOT NULL,

    CONSTRAINT "WorkflowEdge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkflowApp" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(255) NOT NULL,
    "FK_workspaceId" TEXT,

    CONSTRAINT "WorkflowApp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkflowAppConnection" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(255) NOT NULL,
    "inputConfig" JSONB NOT NULL,
    "FK_workflowAppId" TEXT NOT NULL,

    CONSTRAINT "WorkflowAppConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkflowAppAction" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(255) NOT NULL,
    "inputConfig" JSONB NOT NULL,
    "FK_workflowAppId" TEXT NOT NULL,

    CONSTRAINT "WorkflowAppAction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkflowAppTrigger" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(255) NOT NULL,
    "inputConfig" JSONB NOT NULL,
    "FK_workflowAppId" TEXT NOT NULL,

    CONSTRAINT "WorkflowAppTrigger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ProjectToWorkspaceUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ProjectToWorkspaceUser_AB_unique" ON "_ProjectToWorkspaceUser"("A", "B");

-- CreateIndex
CREATE INDEX "_ProjectToWorkspaceUser_B_index" ON "_ProjectToWorkspaceUser"("B");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_FK_workspaceId_fkey" FOREIGN KEY ("FK_workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Workflow" ADD CONSTRAINT "Workflow_FK_projectId_fkey" FOREIGN KEY ("FK_projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowNode" ADD CONSTRAINT "WorkflowNode_FK_workflowAppId_fkey" FOREIGN KEY ("FK_workflowAppId") REFERENCES "WorkflowApp"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowNode" ADD CONSTRAINT "WorkflowNode_FK_workflowId_fkey" FOREIGN KEY ("FK_workflowId") REFERENCES "Workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowEdge" ADD CONSTRAINT "WorkflowEdge_FK_workflowId_fkey" FOREIGN KEY ("FK_workflowId") REFERENCES "Workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowApp" ADD CONSTRAINT "WorkflowApp_FK_workspaceId_fkey" FOREIGN KEY ("FK_workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowAppConnection" ADD CONSTRAINT "WorkflowAppConnection_FK_workflowAppId_fkey" FOREIGN KEY ("FK_workflowAppId") REFERENCES "WorkflowApp"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowAppAction" ADD CONSTRAINT "WorkflowAppAction_FK_workflowAppId_fkey" FOREIGN KEY ("FK_workflowAppId") REFERENCES "WorkflowApp"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowAppTrigger" ADD CONSTRAINT "WorkflowAppTrigger_FK_workflowAppId_fkey" FOREIGN KEY ("FK_workflowAppId") REFERENCES "WorkflowApp"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_FK_workspaceUserId_fkey" FOREIGN KEY ("FK_workspaceUserId") REFERENCES "WorkspaceUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProjectToWorkspaceUser" ADD CONSTRAINT "_ProjectToWorkspaceUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProjectToWorkspaceUser" ADD CONSTRAINT "_ProjectToWorkspaceUser_B_fkey" FOREIGN KEY ("B") REFERENCES "WorkspaceUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
