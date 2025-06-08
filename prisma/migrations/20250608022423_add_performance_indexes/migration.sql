-- CreateIndex
CREATE INDEX "customer_firstName_lastName_email_idx" ON "customer"("firstName", "lastName", "email");

-- CreateIndex
CREATE INDEX "customer_createdAt_firstName_lastName_idx" ON "customer"("createdAt", "firstName", "lastName");

-- CreateIndex
CREATE INDEX "booking_status_preferredDate_idx" ON "booking"("status", "preferredDate");

-- CreateIndex
CREATE INDEX "booking_createdAt_status_idx" ON "booking"("createdAt", "status");

-- CreateIndex
CREATE INDEX "booking_email_status_idx" ON "booking"("email", "status");

-- CreateIndex
CREATE INDEX "booking_customerId_preferredDate_idx" ON "booking"("customerId", "preferredDate");

-- CreateIndex
CREATE INDEX "booking_preferredDate_status_idx" ON "booking"("preferredDate", "status");

-- CreateIndex
CREATE INDEX "booking_customerId_status_createdAt_idx" ON "booking"("customerId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "tattoo_design_isApproved_createdAt_idx" ON "tattoo_design"("isApproved", "createdAt");

-- CreateIndex
CREATE INDEX "tattoo_design_designType_isApproved_createdAt_idx" ON "tattoo_design"("designType", "isApproved", "createdAt");

-- CreateIndex
CREATE INDEX "tattoo_design_artistId_isApproved_createdAt_idx" ON "tattoo_design"("artistId", "isApproved", "createdAt");

-- CreateIndex
CREATE INDEX "tattoo_design_isApproved_designType_idx" ON "tattoo_design"("isApproved", "designType");

-- CreateIndex
CREATE INDEX "payment_status_createdAt_idx" ON "payment"("status", "createdAt");

-- CreateIndex
CREATE INDEX "payment_bookingId_status_idx" ON "payment"("bookingId", "status");

-- CreateIndex
CREATE INDEX "payment_createdAt_status_idx" ON "payment"("createdAt", "status");

-- CreateIndex
CREATE INDEX "cal_analytics_event_timestamp_eventType_idx" ON "cal_analytics_event"("timestamp", "eventType");

-- CreateIndex
CREATE INDEX "cal_analytics_event_sessionId_timestamp_idx" ON "cal_analytics_event"("sessionId", "timestamp");

-- CreateIndex
CREATE INDEX "cal_analytics_event_eventType_serviceId_timestamp_idx" ON "cal_analytics_event"("eventType", "serviceId", "timestamp");

-- CreateIndex
CREATE INDEX "cal_booking_funnel_sessionId_stepOrder_idx" ON "cal_booking_funnel"("sessionId", "stepOrder");

-- CreateIndex
CREATE INDEX "cal_booking_funnel_completed_step_timestamp_idx" ON "cal_booking_funnel"("completed", "step", "timestamp");

-- CreateIndex
CREATE INDEX "cal_booking_funnel_step_completed_timestamp_idx" ON "cal_booking_funnel"("step", "completed", "timestamp");

-- CreateIndex
CREATE INDEX "cal_service_analytics_date_serviceId_eventType_idx" ON "cal_service_analytics"("date", "serviceId", "eventType");

-- CreateIndex
CREATE INDEX "cal_service_analytics_serviceId_date_idx" ON "cal_service_analytics"("serviceId", "date");

-- CreateIndex
CREATE INDEX "rateLimit_key_lastRequest_idx" ON "rateLimit"("key", "lastRequest");