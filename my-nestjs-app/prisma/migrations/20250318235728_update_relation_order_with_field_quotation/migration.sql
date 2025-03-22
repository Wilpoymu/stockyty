-- AlterTable
ALTER TABLE `order_details` MODIFY `quotationId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `order_details` ADD CONSTRAINT `order_details_quotationId_fkey` FOREIGN KEY (`quotationId`) REFERENCES `quotations`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
