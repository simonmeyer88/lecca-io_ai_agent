-- Update existing NULL values in llmModel to 'gpt-4o'
UPDATE "Agent" SET "llmModel" = 'gpt-4o' WHERE "llmModel" IS NULL;

-- Now alter the table to set the column requirements and defaults
ALTER TABLE "Agent" 
    ADD COLUMN "llmProvider" TEXT NOT NULL DEFAULT 'openai',
    ALTER COLUMN "llmModel" SET NOT NULL,
    ALTER COLUMN "llmModel" SET DEFAULT 'gpt-4o';