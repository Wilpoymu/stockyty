/*
  Warnings:

  - You are about to drop the column `description` on the `categoryproduct` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `categoryproduct` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `CategoryProduct_name_key` ON `categoryproduct`;

-- AlterTable
ALTER TABLE `categoryproduct` DROP COLUMN `description`,
    DROP COLUMN `name`;
