-- DropForeignKey
ALTER TABLE `quotation_details` DROP FOREIGN KEY `quotation_details_brandId_fkey`;

-- DropIndex
DROP INDEX `quotation_details_brandId_fkey` ON `quotation_details`;

-- AlterTable
ALTER TABLE `quotation_details` MODIFY `brandId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `quotation_details` ADD CONSTRAINT `quotation_details_brandId_fkey` FOREIGN KEY (`brandId`) REFERENCES `brands`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
