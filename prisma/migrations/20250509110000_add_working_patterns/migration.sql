-- CreateTable
CREATE TABLE "WorkingPattern" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "artistId" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "monday" JSONB,
    "tuesday" JSONB,
    "wednesday" JSONB,
    "thursday" JSONB,
    "friday" JSONB,
    "saturday" JSONB,
    "sunday" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkingPattern_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WorkingPattern_artistId_idx" ON "WorkingPattern"("artistId");

-- CreateIndex
CREATE INDEX "WorkingPattern_isDefault_idx" ON "WorkingPattern"("isDefault");

-- AddForeignKey
ALTER TABLE "WorkingPattern" ADD CONSTRAINT "WorkingPattern_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "Artist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add a default working pattern for each existing artist
INSERT INTO "WorkingPattern" ("id", "name", "artistId", "isDefault", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday", "createdAt", "updatedAt")
SELECT 
  gen_random_uuid(), 
  'Regular Hours', 
  id,
  true,
  '{"slots": [{"start": "09:00", "end": "17:00"}]}',
  '{"slots": [{"start": "09:00", "end": "17:00"}]}',
  '{"slots": [{"start": "09:00", "end": "17:00"}]}',
  '{"slots": [{"start": "09:00", "end": "17:00"}]}',
  '{"slots": [{"start": "09:00", "end": "17:00"}]}',
  '{"slots": [{"start": "10:00", "end": "16:00"}]}',
  NULL,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "Artist";
