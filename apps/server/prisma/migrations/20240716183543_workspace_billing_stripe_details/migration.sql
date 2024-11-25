/*
  Warnings:

  - You are about to drop the column `periodEnd` on the `WorkspaceBilling` table. All the data in the column will be lost.
  - You are about to drop the column `periodStart` on the `WorkspaceBilling` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "WorkspaceBilling" DROP COLUMN "periodEnd",
DROP COLUMN "periodStart",
ADD COLUMN     "stripeCurrentPeriodEnd" TIMESTAMP(3),
ADD COLUMN     "stripePriceId" TEXT,
ADD COLUMN     "stripeSubscriptionId" TEXT;
