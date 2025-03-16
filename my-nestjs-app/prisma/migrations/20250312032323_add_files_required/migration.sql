/*
  Warnings:

  - Made the column `price` on table `products` required. This step will fail if there are existing NULL values in that column.
  - Made the column `stock` on table `products` required. This step will fail if there are existing NULL values in that column.
  - Made the column `sku` on table `products` required. This step will fail if there are existing NULL values in that column.
  - Made the column `status` on table `products` required. This step will fail if there are existing NULL values in that column.
  - Made the column `categoryId` on table `products` required. This step will fail if there are existing NULL values in that column.
  - Made the column `brandId` on table `products` required. This step will fail if there are existing NULL values in that column.
  - Made the column `cost` on table `products` required. This step will fail if there are existing NULL values in that column.
  - Made the column `image` on table `products` required. This step will fail if there are existing NULL values in that column.
  - Made the column `isActive` on table `products` required. This step will fail if there are existing NULL values in that column.
  - Made the column `isImei` on table `products` required. This step will fail if there are existing NULL values in that column.
  - Made the column `isVariant` on table `products` required. This step will fail if there are existing NULL values in that column.
  - Made the column `note` on table `products` required. This step will fail if there are existing NULL values in that column.
  - Made the column `stockAlert` on table `products` required. This step will fail if there are existing NULL values in that column.
  - Made the column `taxMethod` on table `products` required. This step will fail if there are existing NULL values in that column.
  - Made the column `type` on table `products` required. This step will fail if there are existing NULL values in that column.
  - Made the column `typeBarcode` on table `products` required. This step will fail if there are existing NULL values in that column.
  - Made the column `unitId` on table `products` required. This step will fail if there are existing NULL values in that column.
  - Made the column `unitPurchaseId` on table `products` required. This step will fail if there are existing NULL values in that column.
  - Made the column `unitSaleId` on table `products` required. This step will fail if there are existing NULL values in that column.
  - Made the column `code` on table `providers` required. This step will fail if there are existing NULL values in that column.
  - Made the column `grandTotal` on table `purchases` required. This step will fail if there are existing NULL values in that column.
  - Made the column `paidAmount` on table `purchases` required. This step will fail if there are existing NULL values in that column.
  - Made the column `taxNet` on table `purchases` required. This step will fail if there are existing NULL values in that column.
  - Made the column `taxRate` on table `purchases` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `products` DROP FOREIGN KEY `fk_product_brand`;

-- DropForeignKey
ALTER TABLE `products` DROP FOREIGN KEY `fk_product_unit`;

-- DropForeignKey
ALTER TABLE `products` DROP FOREIGN KEY `fk_product_unit_purchase`;

-- DropForeignKey
ALTER TABLE `products` DROP FOREIGN KEY `fk_product_unit_sale`;

-- DropForeignKey
ALTER TABLE `products` DROP FOREIGN KEY `products_categoryId_fkey`;

-- DropIndex
DROP INDEX `fk_product_brand` ON `products`;

-- DropIndex
DROP INDEX `fk_product_unit` ON `products`;

-- DropIndex
DROP INDEX `fk_product_unit_purchase` ON `products`;

-- DropIndex
DROP INDEX `fk_product_unit_sale` ON `products`;

-- DropIndex
DROP INDEX `products_categoryId_fkey` ON `products`;

-- AlterTable
ALTER TABLE `products` MODIFY `price` DECIMAL(10, 2) NOT NULL,
    MODIFY `stock` INTEGER NOT NULL DEFAULT 0,
    MODIFY `sku` VARCHAR(191) NOT NULL,
    MODIFY `status` INTEGER NOT NULL DEFAULT 1,
    MODIFY `categoryId` VARCHAR(191) NOT NULL,
    MODIFY `brandId` VARCHAR(191) NOT NULL,
    MODIFY `cost` DECIMAL(10, 2) NOT NULL,
    MODIFY `image` VARCHAR(191) NOT NULL,
    MODIFY `isActive` INTEGER NOT NULL,
    MODIFY `isImei` INTEGER NOT NULL,
    MODIFY `isVariant` INTEGER NOT NULL,
    MODIFY `note` TEXT NOT NULL,
    MODIFY `stockAlert` DOUBLE NOT NULL,
    MODIFY `taxMethod` VARCHAR(191) NOT NULL,
    MODIFY `type` VARCHAR(191) NOT NULL,
    MODIFY `typeBarcode` VARCHAR(191) NOT NULL,
    MODIFY `unitId` VARCHAR(191) NOT NULL,
    MODIFY `unitPurchaseId` VARCHAR(191) NOT NULL,
    MODIFY `unitSaleId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `providers` MODIFY `code` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `purchases` MODIFY `grandTotal` DOUBLE NOT NULL,
    MODIFY `paidAmount` DOUBLE NOT NULL,
    MODIFY `taxNet` DOUBLE NOT NULL,
    MODIFY `taxRate` DOUBLE NOT NULL;

-- AddForeignKey
ALTER TABLE `products` ADD CONSTRAINT `products_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `products` ADD CONSTRAINT `fk_product_unit` FOREIGN KEY (`unitId`) REFERENCES `units`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `products` ADD CONSTRAINT `fk_product_unit_sale` FOREIGN KEY (`unitSaleId`) REFERENCES `units`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `products` ADD CONSTRAINT `fk_product_unit_purchase` FOREIGN KEY (`unitPurchaseId`) REFERENCES `units`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `products` ADD CONSTRAINT `fk_product_brand` FOREIGN KEY (`brandId`) REFERENCES `brands`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
