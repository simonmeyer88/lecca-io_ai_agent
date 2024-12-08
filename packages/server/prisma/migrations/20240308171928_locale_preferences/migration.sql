-- CreateEnum
CREATE TYPE "CompanyUserPreferencesLocale" AS ENUM ('en', 'es');

-- AlterTable
ALTER TABLE "CompanyUserPreferences" ADD COLUMN     "locale" "CompanyUserPreferencesLocale" NOT NULL DEFAULT 'en';
