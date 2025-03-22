/*
  Warnings:

  - Added the required column `taxAmount` to the `quotation_details` table without a default value. This is not possible if the table is not empty.
  - Added the required column `taxAmount` to the `quotations` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `quotation_details` ADD COLUMN `taxAmount` DOUBLE NOT NULL;

-- AlterTable
ALTER TABLE `quotations` ADD COLUMN `taxAmount` DOUBLE NOT NULL;

-- AddForeignKey
ALTER TABLE `quotations` ADD CONSTRAINT `quotations_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
