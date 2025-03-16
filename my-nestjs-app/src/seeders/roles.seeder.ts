/**
 * @module RolesSeeder
 * @description Seeder for roles. This module seeds default roles if they do not already exist.
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seeds roles in the database if they do not already exist.
 *
 * This function checks if at least 4 roles exist in the database. If not, it
 * upserts the default roles: ADMIN, MANAGER, EMPLOYEE, and CLIENT.
 *
 * @async
 * @function seedRolesIfNotExist
 * @returns {Promise<void>} A promise that resolves when the seeding operation completes.
 */
export async function seedRolesIfNotExist(): Promise<void> {
  const count = await prisma.role.count();

  // If there are at least 4 roles, do nothing.
  if (count >= 4) return;

  const roles = [
    {
      id: '1',
      name: 'ADMIN',
      description: 'Administrator',
      label: 'Admin',
      status: 1,
    },
    {
      id: '2',
      name: 'MANAGER',
      description: 'Manager',
      label: 'Manager',
      status: 1,
    },
    {
      id: '3',
      name: 'EMPLOYEE',
      description: 'Employee',
      label: 'Employee',
      status: 1,
    },
    {
      id: '4',
      name: 'CLIENT',
      description: 'Client',
      label: 'Client',
      status: 1,
    },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { id: role.id },
      update: {},
      create: {
        id: role.id,
        name: role.name,
        description: role.description,
        label: role.label,
        status: role.status,
      },
    });
  }
}
