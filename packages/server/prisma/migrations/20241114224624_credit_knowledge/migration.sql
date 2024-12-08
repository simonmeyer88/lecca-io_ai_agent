-- AlterTable
ALTER TABLE "Credit" ADD COLUMN     "FK_knowledgeId" TEXT;

-- AddForeignKey
ALTER TABLE "Credit" ADD CONSTRAINT "Credit_FK_knowledgeId_fkey" FOREIGN KEY ("FK_knowledgeId") REFERENCES "Knowledge"("id") ON DELETE SET NULL ON UPDATE CASCADE;
