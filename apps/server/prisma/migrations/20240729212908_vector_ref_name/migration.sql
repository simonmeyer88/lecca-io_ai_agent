-- Step 1: Add the new column with a default value
ALTER TABLE "KnowledgeVectorRef" ADD COLUMN "name" VARCHAR(100) DEFAULT '';

-- Step 2: Update existing rows to have the default value
UPDATE "KnowledgeVectorRef" SET "name" = '';

-- Step 3: Alter the column to be NOT NULL without the default value
ALTER TABLE "KnowledgeVectorRef" ALTER COLUMN "name" SET NOT NULL;
ALTER TABLE "KnowledgeVectorRef" ALTER COLUMN "name" DROP DEFAULT;