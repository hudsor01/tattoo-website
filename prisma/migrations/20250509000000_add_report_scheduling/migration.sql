-- CreateTable
CREATE TABLE "scheduled_reports" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "report_type" TEXT NOT NULL,
  "format" TEXT NOT NULL,
  "schedule" TEXT NOT NULL,
  "start_date" TIMESTAMP(3) NOT NULL,
  "end_date" TIMESTAMP(3) NOT NULL,
  "recipients" TEXT NOT NULL,
  "next_execution_date" TIMESTAMP(3) NOT NULL,
  "last_execution_date" TIMESTAMP(3),
  "last_execution_status" TEXT,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "scheduled_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report_execution_log" (
  "id" TEXT NOT NULL,
  "report_id" TEXT NOT NULL,
  "execution_date" TIMESTAMP(3) NOT NULL,
  "status" TEXT NOT NULL,
  "recipient_count" INTEGER,
  "error" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "report_execution_log_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "report_execution_log" ADD CONSTRAINT "report_execution_log_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "scheduled_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "scheduled_reports_next_execution_date_idx" ON "scheduled_reports"("next_execution_date");
CREATE INDEX "scheduled_reports_is_active_idx" ON "scheduled_reports"("is_active");
CREATE INDEX "report_execution_log_report_id_idx" ON "report_execution_log"("report_id");
CREATE INDEX "report_execution_log_execution_date_idx" ON "report_execution_log"("execution_date");
