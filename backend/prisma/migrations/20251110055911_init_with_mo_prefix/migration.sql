-- CreateTable
CREATE TABLE "mo_products" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" INTEGER NOT NULL,
    "category" TEXT,
    "size" TEXT,
    "color" TEXT,
    "marketLink" TEXT,
    "marketUrl" TEXT,
    "composedImageUrl" TEXT,
    "sendCount" INTEGER NOT NULL DEFAULT 0,
    "readCount" INTEGER NOT NULL DEFAULT 0,
    "clickCount" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mo_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mo_product_images" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mo_product_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mo_contacts" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "phone" TEXT NOT NULL,
    "kakaoId" TEXT,
    "groupName" TEXT,
    "tags" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mo_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mo_send_jobs" (
    "id" TEXT NOT NULL,
    "productIds" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "recipientCount" INTEGER NOT NULL DEFAULT 0,
    "successCount" INTEGER NOT NULL DEFAULT 0,
    "failCount" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "scheduledAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mo_send_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mo_send_logs" (
    "id" TEXT NOT NULL,
    "sendJobId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "errorCode" TEXT,
    "errorMessage" TEXT,
    "externalMessageId" TEXT,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mo_send_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mo_tracking_events" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "contactId" TEXT,
    "sendLogId" TEXT,
    "eventType" TEXT NOT NULL,
    "trackingCode" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mo_tracking_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mo_compose_jobs" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "templateType" TEXT NOT NULL DEFAULT 'grid',
    "resultUrl" TEXT,
    "errorMessage" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mo_compose_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mo_settings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mo_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "mo_products_name_idx" ON "mo_products"("name");

-- CreateIndex
CREATE INDEX "mo_products_category_idx" ON "mo_products"("category");

-- CreateIndex
CREATE INDEX "mo_products_status_idx" ON "mo_products"("status");

-- CreateIndex
CREATE INDEX "mo_products_createdAt_idx" ON "mo_products"("createdAt");

-- CreateIndex
CREATE INDEX "mo_product_images_productId_idx" ON "mo_product_images"("productId");

-- CreateIndex
CREATE INDEX "mo_product_images_sequence_idx" ON "mo_product_images"("sequence");

-- CreateIndex
CREATE UNIQUE INDEX "mo_contacts_phone_key" ON "mo_contacts"("phone");

-- CreateIndex
CREATE INDEX "mo_contacts_phone_idx" ON "mo_contacts"("phone");

-- CreateIndex
CREATE INDEX "mo_contacts_groupName_idx" ON "mo_contacts"("groupName");

-- CreateIndex
CREATE INDEX "mo_send_logs_sendJobId_idx" ON "mo_send_logs"("sendJobId");

-- CreateIndex
CREATE INDEX "mo_send_logs_contactId_idx" ON "mo_send_logs"("contactId");

-- CreateIndex
CREATE UNIQUE INDEX "mo_tracking_events_trackingCode_key" ON "mo_tracking_events"("trackingCode");

-- CreateIndex
CREATE INDEX "mo_tracking_events_productId_idx" ON "mo_tracking_events"("productId");

-- CreateIndex
CREATE INDEX "mo_tracking_events_trackingCode_idx" ON "mo_tracking_events"("trackingCode");

-- CreateIndex
CREATE UNIQUE INDEX "mo_settings_key_key" ON "mo_settings"("key");

-- CreateIndex
CREATE INDEX "mo_settings_key_idx" ON "mo_settings"("key");

-- AddForeignKey
ALTER TABLE "mo_product_images" ADD CONSTRAINT "mo_product_images_productId_fkey" FOREIGN KEY ("productId") REFERENCES "mo_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mo_send_logs" ADD CONSTRAINT "mo_send_logs_sendJobId_fkey" FOREIGN KEY ("sendJobId") REFERENCES "mo_send_jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mo_send_logs" ADD CONSTRAINT "mo_send_logs_productId_fkey" FOREIGN KEY ("productId") REFERENCES "mo_products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mo_send_logs" ADD CONSTRAINT "mo_send_logs_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "mo_contacts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mo_tracking_events" ADD CONSTRAINT "mo_tracking_events_productId_fkey" FOREIGN KEY ("productId") REFERENCES "mo_products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mo_tracking_events" ADD CONSTRAINT "mo_tracking_events_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "mo_contacts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mo_tracking_events" ADD CONSTRAINT "mo_tracking_events_sendLogId_fkey" FOREIGN KEY ("sendLogId") REFERENCES "mo_send_logs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mo_compose_jobs" ADD CONSTRAINT "mo_compose_jobs_productId_fkey" FOREIGN KEY ("productId") REFERENCES "mo_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
