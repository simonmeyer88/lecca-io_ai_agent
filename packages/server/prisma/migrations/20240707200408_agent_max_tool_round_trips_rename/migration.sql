/*
  Warnings:

  - You are about to drop the column `maxToolRoundTrips` on the `Agent` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Agent" DROP COLUMN "maxToolRoundTrips",
ADD COLUMN     "maxToolRoundtrips" INTEGER;
