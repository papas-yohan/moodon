-- DropForeignKey
ALTER TABLE "mo_send_logs" DROP CONSTRAINT "mo_send_logs_productId_fkey";

-- DropForeignKey
ALTER TABLE "mo_tracking_events" DROP CONSTRAINT "mo_tracking_events_productId_fkey";

-- AddForeignKey
ALTER TABLE "mo_send_logs" ADD CONSTRAINT "mo_send_logs_productId_fkey" FOREIGN KEY ("productId") REFERENCES "mo_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mo_tracking_events" ADD CONSTRAINT "mo_tracking_events_productId_fkey" FOREIGN KEY ("productId") REFERENCES "mo_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
