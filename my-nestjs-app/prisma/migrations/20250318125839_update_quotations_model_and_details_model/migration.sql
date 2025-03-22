/*
  Warnings:

  - You are about to drop the column `brand` on the `quotation_details` table. All the data in the column will be lost.
  - You are about to drop the column `discountMethod` on the `quotation_details` table. All the data in the column will be lost.
  - You are about to drop the column `orderId` on the `quotation_details` table. All the data in the column will be lost.
  - You are about to drop the column `taxMethod` on the `quotation_details` table. All the data in the column will be lost.
  - You are about to drop the column `taxNet` on the `quotation_details` table. All the data in the column will be lost.
  - You are about to drop the column `total` on the `quotation_details` table. All the data in the column will be lost.
  - You are about to drop the column `adminExpenses` on the `quotations` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `quotations` table. All the data in the column will be lost.
  - You are about to drop the column `discount` on the `quotations` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `quotations` table. All the data in the column will be lost.
  - You are about to drop the column `productId` on the `quotations` table. All the data in the column will be lost.
  - You are about to drop the column `profit` on the `quotations` table. All the data in the column will be lost.
  - You are about to drop the column `ref` on the `quotations` table. All the data in the column will be lost.
  - You are about to drop the column `taxNet` on the `quotations` table. All the data in the column will be lost.
  - Added the required column `cost` to the `brands` table without a default value. This is not possible if the table is not empty.
  - Added the required column `brandCost` to the `quotation_details` table without a default value. This is not possible if the table is not empty.
  - Added the required column `commercialDiscount` to the `quotation_details` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `quotation_details` table without a default value. This is not possible if the table is not empty.
  - Added the required column `finalTotal` to the `quotation_details` table without a default value. This is not possible if the table is not empty.
  - Added the required column `finalUnitPrice` to the `quotation_details` table without a default value. This is not possible if the table is not empty.
  - Added the required column `netTotal` to the `quotation_details` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalWithBrand` to the `quotation_details` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quotationNumber` to the `quotations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subTotal` to the `quotations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalDiscount` to the `quotations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalNet` to the `quotations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalWithTax` to the `quotations` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `quotation_details` DROP FOREIGN KEY `quotation_details_quotationId_fkey`;

-- AlterTable
ALTER TABLE `brands` ADD COLUMN `cost` DOUBLE NOT NULL;

-- AlterTable
ALTER TABLE `quotation_details` DROP COLUMN `brand`,
    DROP COLUMN `discountMethod`,
    DROP COLUMN `orderId`,
    DROP COLUMN `taxMethod`,
    DROP COLUMN `taxNet`,
    DROP COLUMN `total`,
    ADD COLUMN `brandCost` DOUBLE NOT NULL,
    ADD COLUMN `brandId` VARCHAR(191) NULL,
    ADD COLUMN `commercialDiscType` INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN `commercialDiscount` DOUBLE NOT NULL,
    ADD COLUMN `description` VARCHAR(191) NOT NULL,
    ADD COLUMN `discountType` INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN `finalTotal` DOUBLE NOT NULL,
    ADD COLUMN `finalUnitPrice` DOUBLE NOT NULL,
    ADD COLUMN `hasPriceRanges` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `netTotal` DOUBLE NOT NULL,
    ADD COLUMN `profitPercentage` DOUBLE NOT NULL DEFAULT 20,
    ADD COLUMN `totalWithBrand` DOUBLE NOT NULL;

-- AlterTable
ALTER TABLE `quotations` DROP COLUMN `adminExpenses`,
    DROP COLUMN `date`,
    DROP COLUMN `discount`,
    DROP COLUMN `notes`,
    DROP COLUMN `productId`,
    DROP COLUMN `profit`,
    DROP COLUMN `ref`,
    DROP COLUMN `taxNet`,
    ADD COLUMN `deliveryDate` VARCHAR(191) NULL,
    ADD COLUMN `employeeAssignedId` VARCHAR(191) NULL,
    ADD COLUMN `includesTax` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `internalNotes` VARCHAR(191) NULL,
    ADD COLUMN `observations` VARCHAR(191) NULL,
    ADD COLUMN `paymentTerms` VARCHAR(191) NULL,
    ADD COLUMN `quotationNumber` VARCHAR(191) NOT NULL,
    ADD COLUMN `subTotal` DOUBLE NOT NULL,
    ADD COLUMN `totalDiscount` DOUBLE NOT NULL,
    ADD COLUMN `totalNet` DOUBLE NOT NULL,
    ADD COLUMN `totalWithTax` DOUBLE NOT NULL;

-- CreateTable
CREATE TABLE `product_price_ranges` (
    `id` VARCHAR(191) NOT NULL,
    `quotationDetailId` VARCHAR(191) NOT NULL,
    `minQuantity` DOUBLE NOT NULL,
    `maxQuantity` DOUBLE NULL,
    `unitPrice` DOUBLE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `quotation_status_history` (
    `id` VARCHAR(191) NOT NULL,
    `quotationId` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 1,
    `userId` VARCHAR(191) NOT NULL,
    `comment` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `quotation_comments` (
    `id` VARCHAR(191) NOT NULL,
    `quotationId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `comment` VARCHAR(191) NOT NULL,
    `isInternal` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `quotations` ADD CONSTRAINT `quotations_employeeAssignedId_fkey` FOREIGN KEY (`employeeAssignedId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_price_ranges` ADD CONSTRAINT `product_price_ranges_quotationDetailId_fkey` FOREIGN KEY (`quotationDetailId`) REFERENCES `quotation_details`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `quotation_status_history` ADD CONSTRAINT `quotation_status_history_quotationId_fkey` FOREIGN KEY (`quotationId`) REFERENCES `quotations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `quotation_status_history` ADD CONSTRAINT `quotation_status_history_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `quotation_comments` ADD CONSTRAINT `quotation_comments_quotationId_fkey` FOREIGN KEY (`quotationId`) REFERENCES `quotations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `quotation_comments` ADD CONSTRAINT `quotation_comments_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
