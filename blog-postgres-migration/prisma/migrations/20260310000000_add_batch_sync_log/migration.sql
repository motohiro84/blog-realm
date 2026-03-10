-- CreateTable
CREATE TABLE "batch_sync_log" (
    "id" SERIAL NOT NULL,
    "batch_name" VARCHAR(100) NOT NULL,
    "last_sync_at" TIMESTAMP(6) NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "batch_sync_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "batch_sync_log_batch_name_key" ON "batch_sync_log"("batch_name");
