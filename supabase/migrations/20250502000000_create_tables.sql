-- Migration to create all required tables for the application

-- Create Customer table
CREATE TABLE IF NOT EXISTS "Customer" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "firstName" TEXT NOT NULL,
  "lastName" TEXT NOT NULL,
  "email" TEXT UNIQUE,
  "phone" TEXT,
  "avatarUrl" TEXT,
  "address" TEXT,
  "city" TEXT,
  "state" TEXT,
  "postalCode" TEXT,
  "country" TEXT,
  "birthDate" TIMESTAMP,
  "notes" TEXT,
  "allergies" TEXT,
  "source" TEXT,
  "tags" TEXT[] DEFAULT '{}',
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
);

-- Create User table
CREATE TABLE IF NOT EXISTS "User" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "name" TEXT,
  "email" TEXT UNIQUE NOT NULL,
  "emailVerified" TIMESTAMP,
  "password" TEXT,
  "image" TEXT,
  "role" TEXT NOT NULL DEFAULT 'user',
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
);

-- Create Artist table
CREATE TABLE IF NOT EXISTS "Artist" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" UUID NOT NULL UNIQUE,
  "specialty" TEXT,
  "bio" TEXT,
  "portfolio" TEXT,
  "availableForBooking" BOOLEAN NOT NULL DEFAULT true,
  "hourlyRate" FLOAT,
  "startDate" TIMESTAMP,
  "endDate" TIMESTAMP,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- Create Booking table 
CREATE TABLE IF NOT EXISTS "Booking" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "tattooType" TEXT NOT NULL,
  "size" TEXT NOT NULL,
  "placement" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "preferredDate" TIMESTAMP NOT NULL,
  "preferredTime" TEXT NOT NULL,
  "paymentMethod" TEXT NOT NULL,
  "depositPaid" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  "customerId" UUID,
  "artistId" UUID,
  "notes" TEXT,
  FOREIGN KEY ("customerId") REFERENCES "Customer"("id"),
  FOREIGN KEY ("artistId") REFERENCES "Artist"("id")
);

-- Create Appointment table
CREATE TABLE IF NOT EXISTS "Appointment" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "bookingId" INTEGER UNIQUE,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "startDate" TIMESTAMP NOT NULL,
  "endDate" TIMESTAMP NOT NULL,
  "status" TEXT NOT NULL,
  "deposit" FLOAT,
  "totalPrice" FLOAT,
  "designNotes" TEXT,
  "followUpDate" TIMESTAMP,
  "location" TEXT,
  "customerId" UUID NOT NULL,
  "artistId" UUID NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  FOREIGN KEY ("bookingId") REFERENCES "Booking"("id"),
  FOREIGN KEY ("customerId") REFERENCES "Customer"("id"),
  FOREIGN KEY ("artistId") REFERENCES "Artist"("id")
);

-- Create Payment table
CREATE TABLE IF NOT EXISTS "Payment" (
  "id" SERIAL PRIMARY KEY,
  "bookingId" INTEGER NOT NULL UNIQUE,
  "amount" FLOAT NOT NULL,
  "paymentMethod" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "transactionId" TEXT,
  "customerEmail" TEXT NOT NULL,
  "customerName" TEXT NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  FOREIGN KEY ("bookingId") REFERENCES "Booking"("id")
);

-- Create Session table for authentication
CREATE TABLE IF NOT EXISTS "Session" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "sessionToken" TEXT UNIQUE NOT NULL,
  "userId" UUID NOT NULL,
  "expires" TIMESTAMP NOT NULL,
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- Create VerificationToken table
CREATE TABLE IF NOT EXISTS "VerificationToken" (
  "identifier" TEXT NOT NULL,
  "token" TEXT UNIQUE NOT NULL,
  "expires" TIMESTAMP NOT NULL,
  UNIQUE ("identifier", "token")
);
