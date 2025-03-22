/*
  Warnings:

  - You are about to drop the column `warehouseId` on the `quotations` table. All the data in the column will be lost.
  - You are about to alter the column `status` on the `quotations` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - Added the required column `paymentType` to the `quotations` table without a default value. This is not possible if the table is not empty.
  - Made the column `ref` on table `quotations` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `quotations` DROP COLUMN `warehouseId`,
    ADD COLUMN `paymentType` VARCHAR(191) NOT NULL,
    MODIFY `ref` VARCHAR(191) NOT NULL,
    MODIFY `status` INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE `sales` ADD COLUMN `quotationId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `sales` ADD CONSTRAINT `sales_quotationId_fkey` FOREIGN KEY (`quotationId`) REFERENCES `quotations`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
