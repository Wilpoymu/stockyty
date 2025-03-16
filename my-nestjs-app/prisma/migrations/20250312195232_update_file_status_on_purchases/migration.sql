/*
  Warnings:

  - You are about to drop the column `warehouseId` on the `purchases` table. All the data in the column will be lost.
  - You are about to alter the column `status` on the `purchases` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to drop the column `warehouseId` on the `users` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `users_warehouseId_key` ON `users`;

-- AlterTable
ALTER TABLE `purchases` DROP COLUMN `warehouseId`,
    MODIFY `status` INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE `users` DROP COLUMN `warehouseId`;
