/*
  Warnings:

  - You are about to drop the `TaskMessage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TaskMessageGroup` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TaskMessageUsage` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "TaskMessage" DROP CONSTRAINT "TaskMessage_FK_taskMessageGroupId_fkey";

-- DropForeignKey
ALTER TABLE "TaskMessageGroup" DROP CONSTRAINT "TaskMessageGroup_FK_taskId_fkey";

-- DropForeignKey
ALTER TABLE "TaskMessageUsage" DROP CONSTRAINT "TaskMessageUsage_FK_taskMessageGroupId_fkey";

-- DropTable
DROP TABLE "TaskMessage";

-- DropTable
DROP TABLE "TaskMessageGroup";

-- DropTable
DROP TABLE "TaskMessageUsage";

-- DropEnum
DROP TYPE "TaskMessageType";
