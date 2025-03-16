import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

async function hashPassword(plainTextPassword: string): Promise<string> {
  return bcrypt.hash(plainTextPassword, SALT_ROUNDS);
}

/**
 * Seeds the admin user if it does not already exist.
 *
 * This function checks if an admin user exists (by email). If not, it creates a new admin user
 * with fixed credentials and assigns the ADMIN role via the roleUsers relation.
 *
 * @async
 * @function seedAdminUserIfNotExist
 * @returns {Promise<void>} A promise that resolves when the seeding operation is complete.
 */
export async function seedAdminUserIfNotExist(): Promise<void> {
  // Check if the admin user already exists.
  const existingAdmin = await prisma.user.findFirst({
    where: { email: 'admin@example.com' },
  });
  if (existingAdmin) return;

  // Create the admin user with predefined credentials.
  await prisma.user.create({
    data: {
      id: '1', // The admin user always has the id "1"
      firstname: 'Admin',
      lastname: 'User',
      username: 'admin',
      email: 'admin@example.com',
      password: await hashPassword('adminpassword'), // Hash the plain password
      phone: '3001234567',
      documentNumber: '123456789',
      address: 'Admin Address',
      status: 1,
      avatar: 'avatar.png',
      // Assign the ADMIN role through the roleUsers relation.
      roleUsers: {
        create: {
          roleId: '1',
        },
      },
    },
  });
}
