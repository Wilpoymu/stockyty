-- AlterTable
ALTER TABLE `permissions` MODIFY `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `users` ADD COLUMN `emailVerificationToken` VARCHAR(255) NULL,
    ADD COLUMN `emailVerificationTokenExpiry` DATETIME(3) NULL,
    ADD COLUMN `isEmailVerified` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `resetToken` VARCHAR(255) NULL;
