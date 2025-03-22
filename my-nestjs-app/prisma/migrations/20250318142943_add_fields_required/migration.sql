/*
  Warnings:

  - Made the column `brandId` on table `quotation_details` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `validUntil` to the `quotations` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `purchases` MODIFY `total` DECIMAL(10, 2) NULL;

-- AlterTable
ALTER TABLE `quotation_comments` ADD COLUMN `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `quotation_details` MODIFY `brandId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `quotation_status_history` ADD COLUMN `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `quotations` ADD COLUMN `validUntil` DATETIME(3) NOT NULL;

-- AddForeignKey
ALTER TABLE `quotation_details` ADD CONSTRAINT `quotation_details_brandId_fkey` FOREIGN KEY (`brandId`) REFERENCES `brands`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
