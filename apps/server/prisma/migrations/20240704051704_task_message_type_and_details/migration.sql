/*
  Warnings:

  - You are about to drop the column `toolDetails` on the `TaskMessage` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "TaskMessageType" ADD VALUE 'TRIGGER';

-- AlterTable
ALTER TABLE "TaskMessage" DROP COLUMN "toolDetails",
ADD COLUMN     "details" JSONB;
