/*
  Warnings:

  - You are about to drop the column `toolInvocation` on the `TaskMessage` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "TaskMessage" DROP COLUMN "toolInvocation",
ADD COLUMN     "toolInvocations" JSONB;
