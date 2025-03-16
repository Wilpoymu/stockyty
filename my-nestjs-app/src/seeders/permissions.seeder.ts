import { PrismaClient } from '@prisma/client';
import { Logger } from '@nestjs/common';

const prisma = new PrismaClient();
const logger = new Logger('PermissionsSeeder');

/**
 * Seed de permisos
 */
export const permissions = [
  {
    name: 'users_view',
    label: 'Ver Usuarios',
    description: 'Permiso para ver usuarios',
  },
  {
    name: 'users_add',
    label: 'Añadir Usuarios',
    description: 'Permiso para crear usuarios',
  },
  {
    name: 'users_edit',
    label: 'Editar Usuarios',
    description: 'Permiso para editar usuarios',
  },
  {
    name: 'users_delete',
    label: 'Eliminar Usuarios',
    description: 'Permiso para borrar usuarios',
  },
  {
    name: 'permissions_view',
    label: 'Ver Permisos',
    description: 'Permiso para ver permisos',
  },
  {
    name: 'permissions_add',
    label: 'Añadir Permisos',
    description: 'Permiso para crear permisos',
  },
  {
    name: 'purchases_view',
    label: 'Ver Compras',
    description: 'Permiso para ver compras',
  },
  {
    name: 'products_view',
    label: 'Ver Productos',
    description: 'Permiso para ver productos',
  },
];

export async function seedPermissionsIfNotExist(): Promise<void> {
  logger.log('Checking permissions...');

  for (const permission of permissions) {
    // Verificar si ya existe un permiso con el mismo nombre
    const existingPermission = await prisma.permission.findUnique({
      where: {
        name: permission.name,
      },
    });

    if (existingPermission) {
      logger.warn(
        `Permiso '${permission.name}' ya existe. No se creará un duplicado.`,
      );
    } else {
      // Crear el permiso solo si no existe
      await prisma.permission.create({
        data: permission,
      });
      logger.log(`Permiso '${permission.name}' creado exitosamente.`);
    }
  }

  logger.log('Verificación y creación de permisos completada.');
}
