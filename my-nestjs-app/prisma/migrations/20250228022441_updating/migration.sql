/*
  Warnings:

  - Made the column `sku` on table `product` required. This step will fail if there are existing NULL values in that column.
  - Made the column `categoryId` on table `product` required. This step will fail if there are existing NULL values in that column.
  - Made the column `userId` on table `purchase` required. This step will fail if there are existing NULL values in that column.
  - Made the column `providerId` on table `purchase` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `purchase` DROP FOREIGN KEY `Purchase_providerId_fkey`;

-- DropForeignKey
ALTER TABLE `purchase` DROP FOREIGN KEY `Purchase_userId_fkey`;

-- DropIndex
DROP INDEX `Purchase_providerId_fkey` ON `purchase`;

-- DropIndex
DROP INDEX `Purchase_userId_fkey` ON `purchase`;

-- AlterTable
ALTER TABLE `product` MODIFY `sku` VARCHAR(191) NOT NULL,
    MODIFY `categoryId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `purchase` MODIFY `userId` VARCHAR(191) NOT NULL,
    MODIFY `providerId` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `Purchase` ADD CONSTRAINT `Purchase_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Purchase` ADD CONSTRAINT `Purchase_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `Provider`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
