-- Migration to add Tag table and CustomerToTag join table
-- This addresses the relationship between Customer and Tag models

-- Create Tag table
CREATE TABLE IF NOT EXISTS "Tag" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "name" TEXT UNIQUE NOT NULL,
  "color" TEXT NOT NULL DEFAULT 'gray',
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
);

-- Create join table for Customer-to-Tag many-to-many relationship
CREATE TABLE IF NOT EXISTS "_CustomerToTag" (
  "A" UUID NOT NULL,
  "B" UUID NOT NULL,
  CONSTRAINT "_CustomerToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "_CustomerToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create unique index on A,B pairs to prevent duplicate relationships
CREATE UNIQUE INDEX "_CustomerToTag_AB_unique" ON "_CustomerToTag"("A", "B");

-- Create index on B for efficient lookups
CREATE INDEX "_CustomerToTag_B_index" ON "_CustomerToTag"("B");

-- Ensure there's a tags array column in Customer table for backward compatibility
ALTER TABLE "Customer" 
ADD COLUMN IF NOT EXISTS "tags" TEXT[] DEFAULT '{}';
