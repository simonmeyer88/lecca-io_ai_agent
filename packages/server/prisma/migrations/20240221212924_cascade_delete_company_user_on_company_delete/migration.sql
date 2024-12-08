-- DropForeignKey
ALTER TABLE "CompanyUser" DROP CONSTRAINT "CompanyUser_FK_companyId_fkey";

-- AddForeignKey
ALTER TABLE "CompanyUser" ADD CONSTRAINT "CompanyUser_FK_companyId_fkey" FOREIGN KEY ("FK_companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
