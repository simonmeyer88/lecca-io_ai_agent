/*
  Warnings:

  - You are about to drop the column `continueExecutionDate` on the `Execution` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Execution" DROP COLUMN "continueExecutionDate",
ADD COLUMN     "continueExecutionAt" TIMESTAMP(3);
