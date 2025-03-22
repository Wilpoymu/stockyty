/*
  Warnings:

  - Added the required column `orderId` to the `quotations` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `quotations` ADD COLUMN `orderId` VARCHAR(191) NOT NULL;
