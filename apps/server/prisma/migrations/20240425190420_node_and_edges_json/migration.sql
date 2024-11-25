/*
  Warnings:

  - You are about to drop the `WorkflowEdge` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WorkflowNode` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `edges` to the `Workflow` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nodes` to the `Workflow` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "WorkflowEdge" DROP CONSTRAINT "WorkflowEdge_FK_workflowId_fkey";

-- DropForeignKey
ALTER TABLE "WorkflowNode" DROP CONSTRAINT "WorkflowNode_FK_workflowAppId_fkey";

-- DropForeignKey
ALTER TABLE "WorkflowNode" DROP CONSTRAINT "WorkflowNode_FK_workflowId_fkey";

-- AlterTable
ALTER TABLE "Workflow" ADD COLUMN     "edges" JSONB NOT NULL,
ADD COLUMN     "nodes" JSONB NOT NULL;

-- DropTable
DROP TABLE "WorkflowEdge";

-- DropTable
DROP TABLE "WorkflowNode";

-- DropEnum
DROP TYPE "WorkflowEdgeType";

-- DropEnum
DROP TYPE "WorkflowNodeType";
