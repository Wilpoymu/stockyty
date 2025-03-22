-- AddForeignKey
ALTER TABLE `order_details` ADD CONSTRAINT `order_details_productVariantId_fkey` FOREIGN KEY (`productVariantId`) REFERENCES `product_variants`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
