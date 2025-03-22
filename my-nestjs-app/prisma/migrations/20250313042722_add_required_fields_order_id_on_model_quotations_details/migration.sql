-- AlterTable
ALTER TABLE `quotation_details` ADD COLUMN `orderId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `quotation_details` ADD CONSTRAINT `quotation_details_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `orders` RENAME INDEX `orders_clientId_fkey` TO `orders_clientId_idx`;
