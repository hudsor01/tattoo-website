-- CreateTable
CREATE TABLE "Booking" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "tattooType" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "preferredDates" TEXT NOT NULL,
    "referenceImages" TEXT,
    "consultationNotes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "deposit" REAL,
    "estimatedPrice" REAL,
    "appointmentDate" DATETIME,
    "artistNotes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "bookingType" TEXT NOT NULL DEFAULT 'tattoo',
    "calEventId" TEXT,
    "calBookingUid" TEXT,
    "calRescheduleUid" TEXT,
    "calUserId" TEXT,
    "customerId" TEXT
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "preferredArtist" TEXT,
    "notes" TEXT,
    "tags" TEXT,
    "allergies" TEXT,
    "referralSource" TEXT,
    "preferredStyle" TEXT,
    "skinSensitivity" TEXT,
    "lastAppointmentDate" DATETIME,
    "totalSpent" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "GalleryItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "description" TEXT,
    "tattooType" TEXT NOT NULL,
    "featuredOrder" INTEGER DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "featured_category" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "artistId" TEXT
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" DATETIME,
    "password" TEXT,
    "image" TEXT,
    "role" TEXT NOT NULL DEFAULT 'admin',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "BlogPost" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "excerpt" TEXT,
    "featuredImage" TEXT,
    "category" TEXT,
    "tags" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" DATETIME,
    "views" INTEGER NOT NULL DEFAULT 0,
    "readingTime" INTEGER,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "authorId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "PricingTier" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "serviceType" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "basePrice" REAL NOT NULL,
    "priceRange" TEXT,
    "duration" INTEGER,
    "size" TEXT,
    "complexity" TEXT,
    "includes" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "customOptions" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Customer_email_key" ON "Customer"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "BlogPost_slug_key" ON "BlogPost"("slug");
