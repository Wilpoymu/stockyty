-- DropForeignKey
ALTER TABLE `products` DROP FOREIGN KEY `fk_product_brand`;

-- DropIndex
DROP INDEX `fk_product_brand` ON `products`;

-- AlterTable
ALTER TABLE `products` MODIFY `brandId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `products` ADD CONSTRAINT `fk_product_brand` FOREIGN KEY (`brandId`) REFERENCES `brands`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
