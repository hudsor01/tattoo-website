-- Finalize schema

-- Create the Note table if it doesn't exist
CREATE TABLE IF NOT EXISTS "public"."Note" (
  "id" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "type" TEXT NOT NULL DEFAULT 'manual',
  "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "customerId" TEXT NOT NULL,
  CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);

-- Add index
CREATE INDEX IF NOT EXISTS "Note_customerId_idx" ON "public"."Note"("customerId");

-- Add foreign key
ALTER TABLE "public"."Note" 
ADD CONSTRAINT "Note_customerId_fkey" 
FOREIGN KEY ("customerId") REFERENCES "public"."Customer"("id") 
ON DELETE CASCADE ON UPDATE NO ACTION
NOT VALID;
