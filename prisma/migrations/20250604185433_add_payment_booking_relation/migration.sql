/*
  Warnings:

  - You are about to drop the column `name` on the `booking` table. All the data in the column will be lost.
  - Added the required column `firstName` to the `booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `booking` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "payment_status" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');

-- AlterTable
ALTER TABLE "booking" DROP COLUMN "name",
ADD COLUMN     "firstName" TEXT NOT NULL,
ADD COLUMN     "lastName" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "cal_analytics_event" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "eventName" TEXT NOT NULL,
    "userId" TEXT,
    "serviceId" TEXT,
    "bookingId" INTEGER,
    "properties" JSONB,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "referrer" TEXT,
    "url" TEXT,
    "duration" INTEGER,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cal_analytics_event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cal_booking_funnel" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "step" TEXT NOT NULL,
    "stepOrder" INTEGER NOT NULL,
    "serviceId" TEXT,
    "userId" TEXT,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "abandoned" BOOLEAN NOT NULL DEFAULT false,
    "timeSpent" INTEGER,
    "errorMessage" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cal_booking_funnel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cal_service_analytics" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "serviceName" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "totalRevenue" DOUBLE PRECISION,
    "avgBookingTime" DOUBLE PRECISION,
    "conversionRate" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cal_service_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cal_realtime_metrics" (
    "id" TEXT NOT NULL,
    "liveVisitors" INTEGER NOT NULL DEFAULT 0,
    "activeSessions" INTEGER NOT NULL DEFAULT 0,
    "todayBookings" INTEGER NOT NULL DEFAULT 0,
    "todayRevenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "pendingBookings" INTEGER NOT NULL DEFAULT 0,
    "confirmedBookings" INTEGER NOT NULL DEFAULT 0,
    "cancelledBookings" INTEGER NOT NULL DEFAULT 0,
    "conversionRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "topServiceId" TEXT,
    "avgResponseTime" INTEGER NOT NULL DEFAULT 0,
    "errorRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "systemLoad" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cal_realtime_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" "payment_status" NOT NULL DEFAULT 'PENDING',
    "paymentMethod" TEXT,
    "stripeId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "cal_analytics_event_sessionId_idx" ON "cal_analytics_event"("sessionId");

-- CreateIndex
CREATE INDEX "cal_analytics_event_eventType_idx" ON "cal_analytics_event"("eventType");

-- CreateIndex
CREATE INDEX "cal_analytics_event_userId_idx" ON "cal_analytics_event"("userId");

-- CreateIndex
CREATE INDEX "cal_analytics_event_serviceId_idx" ON "cal_analytics_event"("serviceId");

-- CreateIndex
CREATE INDEX "cal_analytics_event_timestamp_idx" ON "cal_analytics_event"("timestamp");

-- CreateIndex
CREATE INDEX "cal_booking_funnel_sessionId_idx" ON "cal_booking_funnel"("sessionId");

-- CreateIndex
CREATE INDEX "cal_booking_funnel_step_idx" ON "cal_booking_funnel"("step");

-- CreateIndex
CREATE INDEX "cal_booking_funnel_completed_idx" ON "cal_booking_funnel"("completed");

-- CreateIndex
CREATE INDEX "cal_booking_funnel_abandoned_idx" ON "cal_booking_funnel"("abandoned");

-- CreateIndex
CREATE INDEX "cal_booking_funnel_timestamp_idx" ON "cal_booking_funnel"("timestamp");

-- CreateIndex
CREATE INDEX "cal_service_analytics_serviceId_idx" ON "cal_service_analytics"("serviceId");

-- CreateIndex
CREATE INDEX "cal_service_analytics_date_idx" ON "cal_service_analytics"("date");

-- CreateIndex
CREATE INDEX "cal_service_analytics_eventType_idx" ON "cal_service_analytics"("eventType");

-- CreateIndex
CREATE UNIQUE INDEX "cal_service_analytics_serviceId_eventType_date_key" ON "cal_service_analytics"("serviceId", "eventType", "date");

-- CreateIndex
CREATE INDEX "cal_realtime_metrics_timestamp_idx" ON "cal_realtime_metrics"("timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "payment_stripeId_key" ON "payment"("stripeId");

-- CreateIndex
CREATE INDEX "payment_status_idx" ON "payment"("status");

-- CreateIndex
CREATE INDEX "payment_createdAt_idx" ON "payment"("createdAt");

-- CreateIndex
CREATE INDEX "payment_bookingId_idx" ON "payment"("bookingId");

-- AddForeignKey
ALTER TABLE "payment" ADD CONSTRAINT "payment_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;
