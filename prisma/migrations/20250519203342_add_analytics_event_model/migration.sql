-- CreateTable
CREATE TABLE "AnalyticsEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,
    "sessionId" TEXT,
    "category" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "label" TEXT,
    "value" REAL,
    "path" TEXT,
    "referrer" TEXT,
    "deviceType" TEXT,
    "browser" TEXT,
    "os" TEXT,
    "metadata" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "AnalyticsEvent_userId_idx" ON "AnalyticsEvent"("userId");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_sessionId_idx" ON "AnalyticsEvent"("sessionId");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_category_idx" ON "AnalyticsEvent"("category");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_action_idx" ON "AnalyticsEvent"("action");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_timestamp_idx" ON "AnalyticsEvent"("timestamp");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_path_idx" ON "AnalyticsEvent"("path");
