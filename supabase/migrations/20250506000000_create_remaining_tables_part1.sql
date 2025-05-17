-- Migration to create all remaining tables from Prisma schema
-- This addresses tables defined in Prisma but not yet created in the database

-- Create TattooDesign table
CREATE TABLE IF NOT EXISTS "TattooDesign" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "name" TEXT NOT NULL,
  "description" TEXT,
  "fileUrl" TEXT,
  "thumbnailUrl" TEXT,
  "designType" TEXT,
  "size" TEXT,
  "isApproved" BOOLEAN NOT NULL DEFAULT false,
  "approvedAt" TIMESTAMP,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  "artistId" UUID NOT NULL,
  "customerId" UUID,
  FOREIGN KEY ("artistId") REFERENCES "Artist"("id"),
  FOREIGN KEY ("customerId") REFERENCES "Customer"("id")
);

-- Create Transaction table
CREATE TABLE IF NOT EXISTS "Transaction" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "amount" FLOAT NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'USD',
  "status" TEXT NOT NULL,
  "paymentMethod" TEXT NOT NULL,
  "transactionId" TEXT,
  "receiptUrl" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  "customerId" UUID NOT NULL,
  "appointmentId" UUID,
  FOREIGN KEY ("customerId") REFERENCES "Customer"("id"),
  FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id")
);

-- Create Interaction table
CREATE TABLE IF NOT EXISTS "Interaction" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "type" TEXT NOT NULL,
  "subject" TEXT,
  "content" TEXT,
  "direction" TEXT NOT NULL,
  "outcome" TEXT,
  "scheduledAt" TIMESTAMP,
  "completedAt" TIMESTAMP,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  "customerId" UUID NOT NULL,
  "appointmentId" UUID,
  FOREIGN KEY ("customerId") REFERENCES "Customer"("id"),
  FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id")
);
