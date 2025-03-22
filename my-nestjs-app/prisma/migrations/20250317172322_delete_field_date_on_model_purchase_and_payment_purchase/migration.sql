/*
  Warnings:

  - You are about to drop the column `date` on the `payment_purchases` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `purchases` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `payment_purchases` DROP COLUMN `date`;

-- AlterTable
ALTER TABLE `purchases` DROP COLUMN `date`;
