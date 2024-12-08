/*
  Warnings:

  - Made the column `maxToolRoundtrips` on table `Agent` required. This step will fail if there are existing NULL values in that column.

*/
-- Set maxToolRoundtrips to 5 if they're null
UPDATE "Agent"
SET "maxToolRoundtrips" = 5
WHERE "maxToolRoundtrips" IS NULL;

-- AlterTable
ALTER TABLE "Agent" ALTER COLUMN "maxToolRoundtrips" SET NOT NULL,
ALTER COLUMN "maxToolRoundtrips" SET DEFAULT 5;
