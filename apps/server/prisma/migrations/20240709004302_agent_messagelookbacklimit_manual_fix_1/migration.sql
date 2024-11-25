/*
  Warnings:

  - Made the column `messageLookbackLimit` on table `Agent` required. This step will fail if there are existing NULL values in that column.

*/

-- Update existing NULL values
UPDATE "Agent"
SET "messageLookbackLimit" = 5
WHERE "messageLookbackLimit" IS NULL;

-- AlterTable
ALTER TABLE "Agent" ALTER COLUMN "messageLookbackLimit" SET NOT NULL;
