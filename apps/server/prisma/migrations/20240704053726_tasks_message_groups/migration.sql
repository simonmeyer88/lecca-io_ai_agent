/*
  Warnings:

  - You are about to drop the column `FK_taskId` on the `TaskMessage` table. All the data in the column will be lost.
  - You are about to drop the column `FK_taskMessageId` on the `TaskMessageUsage` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[FK_taskMessageGroupId]` on the table `TaskMessageUsage` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `FK_taskMessageGroupId` to the `TaskMessage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `FK_taskMessageGroupId` to the `TaskMessageUsage` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "TaskMessage" DROP CONSTRAINT "TaskMessage_FK_taskId_fkey";

-- DropForeignKey
ALTER TABLE "TaskMessageUsage" DROP CONSTRAINT "TaskMessageUsage_FK_taskMessageId_fkey";

-- DropIndex
DROP INDEX "TaskMessageUsage_FK_taskMessageId_key";

-- AlterTable
ALTER TABLE "TaskMessage" DROP COLUMN "FK_taskId",
ADD COLUMN     "FK_taskMessageGroupId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "TaskMessageUsage" DROP COLUMN "FK_taskMessageId",
ADD COLUMN     "FK_taskMessageGroupId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "TaskMessageGroup" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishReason" TEXT,
    "FK_taskId" TEXT NOT NULL,

    CONSTRAINT "TaskMessageGroup_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TaskMessageUsage_FK_taskMessageGroupId_key" ON "TaskMessageUsage"("FK_taskMessageGroupId");

-- AddForeignKey
ALTER TABLE "TaskMessageGroup" ADD CONSTRAINT "TaskMessageGroup_FK_taskId_fkey" FOREIGN KEY ("FK_taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskMessage" ADD CONSTRAINT "TaskMessage_FK_taskMessageGroupId_fkey" FOREIGN KEY ("FK_taskMessageGroupId") REFERENCES "TaskMessageGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskMessageUsage" ADD CONSTRAINT "TaskMessageUsage_FK_taskMessageGroupId_fkey" FOREIGN KEY ("FK_taskMessageGroupId") REFERENCES "TaskMessageGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;
