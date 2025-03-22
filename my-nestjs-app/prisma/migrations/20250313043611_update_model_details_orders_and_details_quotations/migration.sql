/*
  Warnings:

  - You are about to drop the column `discount` on the `order_details` table. All the data in the column will be lost.
  - You are about to drop the column `discountMethod` on the `order_details` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `order_details` table. All the data in the column will be lost.
  - You are about to drop the column `productVariantId` on the `order_details` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `order_details` table. All the data in the column will be lost.
  - You are about to drop the column `taxMethod` on the `order_details` table. All the data in the column will be lost.
  - You are about to drop the column `taxNet` on the `order_details` table. All the data in the column will be lost.
  - You are about to drop the column `total` on the `order_details` table. All the data in the column will be lost.
  - You are about to drop the column `adminExpenses` on the `quotation_details` table. All the data in the column will be lost.
  - You are about to drop the column `brand` on the `quotation_details` table. All the data in the column will be lost.
  - You are about to drop the column `discount` on the `quotation_details` table. All the data in the column will be lost.
  - You are about to drop the column `discountMethod` on the `quotation_details` table. All the data in the column will be lost.
  - You are about to drop the column `netValue` on the `quotation_details` table. All the data in the column will be lost.
  - You are about to drop the column `profit` on the `quotation_details` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `quotation_details` table. All the data in the column will be lost.
  - You are about to drop the column `subtotal` on the `quotation_details` table. All the data in the column will be lost.
  - You are about to drop the column `taxMethod` on the `quotation_details` table. All the data in the column will be lost.
  - You are about to drop the column `taxNet` on the `quotation_details` table. All the data in the column will be lost.
  - You are about to drop the column `total` on the `quotation_details` table. All the data in the column will be lost.
  - You are about to drop the column `unitPrice` on the `quotation_details` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `order_details` DROP COLUMN `discount`,
    DROP COLUMN `discountMethod`,
    DROP COLUMN `price`,
    DROP COLUMN `productVariantId`,
    DROP COLUMN `quantity`,
    DROP COLUMN `taxMethod`,
    DROP COLUMN `taxNet`,
    DROP COLUMN `total`,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `quotation_details` DROP COLUMN `adminExpenses`,
    DROP COLUMN `brand`,
    DROP COLUMN `discount`,
    DROP COLUMN `discountMethod`,
    DROP COLUMN `netValue`,
    DROP COLUMN `profit`,
    DROP COLUMN `quantity`,
    DROP COLUMN `subtotal`,
    DROP COLUMN `taxMethod`,
    DROP COLUMN `taxNet`,
    DROP COLUMN `total`,
    DROP COLUMN `unitPrice`,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);
