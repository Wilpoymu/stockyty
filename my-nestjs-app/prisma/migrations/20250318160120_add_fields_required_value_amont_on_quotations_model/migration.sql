/*
  Warnings:

  - Added the required column `discountValue` to the `quotation_details` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `quotation_details` ADD COLUMN `discountValue` DOUBLE NOT NULL;
