/*
  Warnings:

  - You are about to drop the column `customerId` on the `user` table. All the data in the column will be lost.
  - You are about to drop the `Appointment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Contact` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Customer` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Note` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `cal_analytics_event` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `cal_booking_funnel` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `cal_bookings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `cal_cache_entry` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `cal_data_retention` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `cal_error_log` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `cal_event_types` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `cal_gdpr_request` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `cal_integration_health` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `cal_metrics_snapshots` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `cal_performance_metrics` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `cal_service_analytics` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `cal_sync_states` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `cal_user_analytics` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `cal_webhook_events` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `settings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `settings_backups` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `settings_history` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "booking_status" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "contact_status" AS ENUM ('NEW', 'READ', 'REPLIED', 'RESOLVED');

-- DropForeignKey
ALTER TABLE "Appointment" DROP CONSTRAINT "Appointment_customerId_fkey";

-- DropForeignKey
ALTER TABLE "Appointment" DROP CONSTRAINT "Appointment_userId_fkey";

-- DropForeignKey
ALTER TABLE "Note" DROP CONSTRAINT "Note_customerId_fkey";

-- DropForeignKey
ALTER TABLE "cal_bookings" DROP CONSTRAINT "cal_bookings_attendeeEmail_fkey";

-- DropForeignKey
ALTER TABLE "settings_history" DROP CONSTRAINT "settings_history_settingId_fkey";

-- AlterTable
ALTER TABLE "user" DROP COLUMN "customerId";

-- DropTable
DROP TABLE "Appointment";

-- DropTable
DROP TABLE "Contact";

-- DropTable
DROP TABLE "Customer";

-- DropTable
DROP TABLE "Note";

-- DropTable
DROP TABLE "cal_analytics_event";

-- DropTable
DROP TABLE "cal_booking_funnel";

-- DropTable
DROP TABLE "cal_bookings";

-- DropTable
DROP TABLE "cal_cache_entry";

-- DropTable
DROP TABLE "cal_data_retention";

-- DropTable
DROP TABLE "cal_error_log";

-- DropTable
DROP TABLE "cal_event_types";

-- DropTable
DROP TABLE "cal_gdpr_request";

-- DropTable
DROP TABLE "cal_integration_health";

-- DropTable
DROP TABLE "cal_metrics_snapshots";

-- DropTable
DROP TABLE "cal_performance_metrics";

-- DropTable
DROP TABLE "cal_service_analytics";

-- DropTable
DROP TABLE "cal_sync_states";

-- DropTable
DROP TABLE "cal_user_analytics";

-- DropTable
DROP TABLE "cal_webhook_events";

-- DropTable
DROP TABLE "settings";

-- DropTable
DROP TABLE "settings_backups";

-- DropTable
DROP TABLE "settings_history";

-- DropEnum
DROP TYPE "AppointmentStatus";

-- DropEnum
DROP TYPE "CalBookingStatus";

-- DropEnum
DROP TYPE "HealthStatus";

-- DropEnum
DROP TYPE "NoteType";

-- DropEnum
DROP TYPE "PaymentStatus";

-- DropEnum
DROP TYPE "SyncStatus";

-- DropEnum
DROP TYPE "UserRole";

-- CreateTable
CREATE TABLE "customer" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "postalCode" TEXT,
    "country" TEXT,
    "birthDate" TIMESTAMP(3),
    "allergies" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking" (
    "id" TEXT NOT NULL,
    "customerId" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "tattooType" TEXT NOT NULL,
    "size" TEXT,
    "placement" TEXT,
    "description" TEXT,
    "preferredDate" TIMESTAMP(3) NOT NULL,
    "preferredTime" TEXT,
    "status" "booking_status" NOT NULL DEFAULT 'PENDING',
    "calBookingUid" TEXT,
    "calEventTypeId" INTEGER,
    "calStatus" TEXT,
    "calMeetingUrl" TEXT,
    "source" TEXT NOT NULL DEFAULT 'website',
    "notes" TEXT,
    "paymentMethod" TEXT,
    "totalAmount" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tattoo_design" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "fileUrl" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "designType" TEXT,
    "size" TEXT,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "artistId" TEXT NOT NULL DEFAULT 'fernando-govea',
    "artistName" TEXT NOT NULL DEFAULT 'Fernando Govea',
    "customerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tattoo_design_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "message" TEXT NOT NULL,
    "status" "contact_status" NOT NULL DEFAULT 'NEW',
    "adminNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contact_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "customer_email_key" ON "customer"("email");

-- CreateIndex
CREATE INDEX "customer_email_idx" ON "customer"("email");

-- CreateIndex
CREATE INDEX "customer_phone_idx" ON "customer"("phone");

-- CreateIndex
CREATE INDEX "customer_firstName_lastName_idx" ON "customer"("firstName", "lastName");

-- CreateIndex
CREATE UNIQUE INDEX "booking_calBookingUid_key" ON "booking"("calBookingUid");

-- CreateIndex
CREATE INDEX "booking_email_idx" ON "booking"("email");

-- CreateIndex
CREATE INDEX "booking_status_idx" ON "booking"("status");

-- CreateIndex
CREATE INDEX "booking_preferredDate_idx" ON "booking"("preferredDate");

-- CreateIndex
CREATE INDEX "booking_calBookingUid_idx" ON "booking"("calBookingUid");

-- CreateIndex
CREATE INDEX "booking_createdAt_idx" ON "booking"("createdAt");

-- CreateIndex
CREATE INDEX "tattoo_design_isApproved_idx" ON "tattoo_design"("isApproved");

-- CreateIndex
CREATE INDEX "tattoo_design_designType_idx" ON "tattoo_design"("designType");

-- CreateIndex
CREATE INDEX "tattoo_design_artistId_idx" ON "tattoo_design"("artistId");

-- CreateIndex
CREATE INDEX "tattoo_design_createdAt_idx" ON "tattoo_design"("createdAt");

-- CreateIndex
CREATE INDEX "contact_email_idx" ON "contact"("email");

-- CreateIndex
CREATE INDEX "contact_status_idx" ON "contact"("status");

-- CreateIndex
CREATE INDEX "contact_createdAt_idx" ON "contact"("createdAt");

-- AddForeignKey
ALTER TABLE "booking" ADD CONSTRAINT "booking_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tattoo_design" ADD CONSTRAINT "tattoo_design_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
