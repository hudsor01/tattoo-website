/*
  Warnings:

  - The primary key for the `Booking` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `appointmentDate` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `artistNotes` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `bookingType` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `calBookingUid` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `calEventId` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `calRescheduleUid` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `calUserId` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `consultationNotes` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `deposit` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `estimatedPrice` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `preferredDates` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `referenceImages` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `size` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `tattooType` on the `Booking` table. All the data in the column will be lost.
  - Added the required column `title` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Made the column `customerId` on table `Booking` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateTable
CREATE TABLE "Appointment" (
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
    "startDate" DATETIME,
    "endDate" DATETIME,
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
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "amount" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "paymentMethod" TEXT NOT NULL DEFAULT 'card',
    "customerId" TEXT NOT NULL,
    "appointmentId" INTEGER,
    "bookingId" TEXT,
    "stripePaymentId" TEXT,
    "receiptUrl" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Booking" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "details" TEXT,
    "status" TEXT NOT NULL DEFAULT 'requested',
    "customerId" TEXT NOT NULL,
    "appointmentId" INTEGER,
    "depositAmount" REAL,
    "finalPrice" REAL,
    "bookingDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "scheduledDate" DATETIME,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Booking" ("createdAt", "customerId", "id", "status", "updatedAt") SELECT "createdAt", "customerId", "id", "status", "updatedAt" FROM "Booking";
DROP TABLE "Booking";
ALTER TABLE "new_Booking" RENAME TO "Booking";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
