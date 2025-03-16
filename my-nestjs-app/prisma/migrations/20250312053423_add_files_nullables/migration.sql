/*
  Warnings:

  - You are about to drop the `_warehouseusers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `warehouses` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `_warehouseusers` DROP FOREIGN KEY `_warehouseUsers_A_fkey`;

-- DropForeignKey
ALTER TABLE `_warehouseusers` DROP FOREIGN KEY `_warehouseUsers_B_fkey`;

-- DropForeignKey
ALTER TABLE `products` DROP FOREIGN KEY `fk_product_unit`;

-- DropForeignKey
ALTER TABLE `products` DROP FOREIGN KEY `fk_product_unit_purchase`;

-- DropForeignKey
ALTER TABLE `products` DROP FOREIGN KEY `fk_product_unit_sale`;

-- DropForeignKey
ALTER TABLE `purchases` DROP FOREIGN KEY `purchases_warehouseId_fkey`;

-- DropForeignKey
ALTER TABLE `quotations` DROP FOREIGN KEY `quotations_warehouseId_fkey`;

-- DropForeignKey
ALTER TABLE `sales` DROP FOREIGN KEY `sales_warehouseId_fkey`;

-- DropForeignKey
ALTER TABLE `users` DROP FOREIGN KEY `users_warehouseId_fkey`;

-- DropIndex
DROP INDEX `fk_product_unit` ON `products`;

-- DropIndex
DROP INDEX `fk_product_unit_purchase` ON `products`;

-- DropIndex
DROP INDEX `fk_product_unit_sale` ON `products`;

-- DropIndex
DROP INDEX `purchases_warehouseId_fkey` ON `purchases`;

-- DropIndex
DROP INDEX `quotations_warehouseId_fkey` ON `quotations`;

-- DropIndex
DROP INDEX `sales_warehouseId_fkey` ON `sales`;

-- AlterTable
ALTER TABLE `products` MODIFY `typeBarcode` VARCHAR(191) NULL,
    MODIFY `unitId` VARCHAR(191) NULL,
    MODIFY `unitPurchaseId` VARCHAR(191) NULL,
    MODIFY `unitSaleId` VARCHAR(191) NULL;

-- DropTable
DROP TABLE `_warehouseusers`;

-- DropTable
DROP TABLE `warehouses`;

-- AddForeignKey
ALTER TABLE `products` ADD CONSTRAINT `fk_product_unit` FOREIGN KEY (`unitId`) REFERENCES `units`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `products` ADD CONSTRAINT `fk_product_unit_sale` FOREIGN KEY (`unitSaleId`) REFERENCES `units`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `products` ADD CONSTRAINT `fk_product_unit_purchase` FOREIGN KEY (`unitPurchaseId`) REFERENCES `units`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
