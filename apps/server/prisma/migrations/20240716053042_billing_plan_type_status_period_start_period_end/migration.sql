-- CreateEnum
CREATE TYPE "BillingPlanType" AS ENUM ('free', 'team', 'professional', 'business', 'custom');

-- CreateEnum
CREATE TYPE "BillingStatus" AS ENUM ('active', 'canceled', 'unpaid');

-- AlterTable
ALTER TABLE "WorkspaceBilling" ADD COLUMN     "periodEnd" TEXT,
ADD COLUMN     "periodStart" TEXT,
ADD COLUMN     "planType" "BillingPlanType" NOT NULL DEFAULT 'free',
ADD COLUMN     "status" "BillingStatus" NOT NULL DEFAULT 'active';
