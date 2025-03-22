/*
  Warnings:

  - You are about to drop the column `createdAt` on the `brands` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `brands` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `order_details` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `order_details` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `product_variants` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `product_variants` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `isImei` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `isVariant` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `stockAlert` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `subCategoryId` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `unitId` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `unitPurchaseId` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `unitSaleId` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `quotation_details` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `quotation_details` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `quotations` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `quotations` table. All the data in the column will be lost.
  - You are about to drop the column `orderId` on the `quotations` table. All the data in the column will be lost.
  - You are about to drop the column `paymentType` on the `quotations` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `quotations` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `sale_details` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `sale_details` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `sales` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `sales` table. All the data in the column will be lost.
  - You are about to drop the column `quotationId` on the `sales` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `sales` table. All the data in the column will be lost.
  - You are about to drop the column `warehouseId` on the `sales` table. All the data in the column will be lost.
  - You are about to drop the `units` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `discount` to the `order_details` table without a default value. This is not possible if the table is not empty.
  - Added the required column `discountMethod` to the `order_details` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price` to the `order_details` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quantity` to the `order_details` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quotationId` to the `order_details` table without a default value. This is not possible if the table is not empty.
  - Added the required column `taxMethod` to the `order_details` table without a default value. This is not possible if the table is not empty.
  - Added the required column `taxNet` to the `order_details` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total` to the `order_details` table without a default value. This is not possible if the table is not empty.
  - Added the required column `adminExpenses` to the `quotation_details` table without a default value. This is not possible if the table is not empty.
  - Added the required column `discount` to the `quotation_details` table without a default value. This is not possible if the table is not empty.
  - Added the required column `discountMethod` to the `quotation_details` table without a default value. This is not possible if the table is not empty.
  - Added the required column `netValue` to the `quotation_details` table without a default value. This is not possible if the table is not empty.
  - Added the required column `profit` to the `quotation_details` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quantity` to the `quotation_details` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subtotal` to the `quotation_details` table without a default value. This is not possible if the table is not empty.
  - Added the required column `taxMethod` to the `quotation_details` table without a default value. This is not possible if the table is not empty.
  - Added the required column `taxNet` to the `quotation_details` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total` to the `quotation_details` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unitPrice` to the `quotation_details` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `products` DROP FOREIGN KEY `fk_product_unit`;

-- DropForeignKey
ALTER TABLE `products` DROP FOREIGN KEY `fk_product_unit_purchase`;

-- DropForeignKey
ALTER TABLE `products` DROP FOREIGN KEY `fk_product_unit_sale`;

-- DropForeignKey
ALTER TABLE `quotation_details` DROP FOREIGN KEY `quotation_details_orderId_fkey`;

-- DropForeignKey
ALTER TABLE `quotation_details` DROP FOREIGN KEY `quotation_details_productId_fkey`;

-- DropForeignKey
ALTER TABLE `quotation_details` DROP FOREIGN KEY `quotation_details_quotationId_fkey`;

-- DropForeignKey
ALTER TABLE `sales` DROP FOREIGN KEY `sales_quotationId_fkey`;

-- DropIndex
DROP INDEX `fk_product_unit` ON `products`;

-- DropIndex
DROP INDEX `fk_product_unit_purchase` ON `products`;

-- DropIndex
DROP INDEX `fk_product_unit_sale` ON `products`;

-- DropIndex
DROP INDEX `quotation_details_orderId_fkey` ON `quotation_details`;

-- DropIndex
DROP INDEX `sales_quotationId_fkey` ON `sales`;

-- AlterTable
ALTER TABLE `brands` DROP COLUMN `createdAt`,
    DROP COLUMN `updatedAt`;

-- AlterTable
ALTER TABLE `order_details` DROP COLUMN `createdAt`,
    DROP COLUMN `updatedAt`,
    ADD COLUMN `discount` DOUBLE NOT NULL,
    ADD COLUMN `discountMethod` VARCHAR(191) NOT NULL,
    ADD COLUMN `price` DOUBLE NOT NULL,
    ADD COLUMN `productVariantId` VARCHAR(191) NULL,
    ADD COLUMN `quantity` DOUBLE NOT NULL,
    ADD COLUMN `quotationId` VARCHAR(191) NOT NULL,
    ADD COLUMN `taxMethod` VARCHAR(191) NOT NULL,
    ADD COLUMN `taxNet` DOUBLE NOT NULL,
    ADD COLUMN `total` DOUBLE NOT NULL;

-- AlterTable
ALTER TABLE `product_variants` DROP COLUMN `createdAt`,
    DROP COLUMN `updatedAt`;

-- AlterTable
ALTER TABLE `products` DROP COLUMN `isActive`,
    DROP COLUMN `isImei`,
    DROP COLUMN `isVariant`,
    DROP COLUMN `stockAlert`,
    DROP COLUMN `subCategoryId`,
    DROP COLUMN `unitId`,
    DROP COLUMN `unitPurchaseId`,
    DROP COLUMN `unitSaleId`;

-- AlterTable
ALTER TABLE `quotation_details` DROP COLUMN `createdAt`,
    DROP COLUMN `updatedAt`,
    ADD COLUMN `adminExpenses` DOUBLE NOT NULL,
    ADD COLUMN `brand` VARCHAR(191) NULL,
    ADD COLUMN `discount` DOUBLE NOT NULL,
    ADD COLUMN `discountMethod` VARCHAR(191) NOT NULL,
    ADD COLUMN `netValue` DOUBLE NOT NULL,
    ADD COLUMN `profit` DOUBLE NOT NULL,
    ADD COLUMN `quantity` DOUBLE NOT NULL,
    ADD COLUMN `subtotal` DOUBLE NOT NULL,
    ADD COLUMN `taxMethod` VARCHAR(191) NOT NULL,
    ADD COLUMN `taxNet` DOUBLE NOT NULL,
    ADD COLUMN `total` DOUBLE NOT NULL,
    ADD COLUMN `unitPrice` DOUBLE NOT NULL;

-- AlterTable
ALTER TABLE `quotations` DROP COLUMN `createdAt`,
    DROP COLUMN `deletedAt`,
    DROP COLUMN `orderId`,
    DROP COLUMN `paymentType`,
    DROP COLUMN `updatedAt`,
    ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `deleted_at` DATETIME(3) NULL,
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `ref` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `sale_details` DROP COLUMN `createdAt`,
    DROP COLUMN `updatedAt`;

-- AlterTable
ALTER TABLE `sales` DROP COLUMN `createdAt`,
    DROP COLUMN `deletedAt`,
    DROP COLUMN `quotationId`,
    DROP COLUMN `updatedAt`,
    DROP COLUMN `warehouseId`,
    ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `deleted_at` DATETIME(3) NULL,
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- DropTable
DROP TABLE `units`;

-- AddForeignKey
ALTER TABLE `quotation_details` ADD CONSTRAINT `fk_quotation_details_quotation` FOREIGN KEY (`quotationId`) REFERENCES `quotations`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `quotation_details` ADD CONSTRAINT `fk_quotation_details_product` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `quotation_details` ADD CONSTRAINT `quotation_details_quotationId_fkey` FOREIGN KEY (`quotationId`) REFERENCES `orders`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
