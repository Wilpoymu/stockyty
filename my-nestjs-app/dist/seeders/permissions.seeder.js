"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.permissions = void 0;
exports.seedPermissionsIfNotExist = seedPermissionsIfNotExist;
const client_1 = require("@prisma/client");
const common_1 = require("@nestjs/common");
const prisma = new client_1.PrismaClient();
const logger = new common_1.Logger('PermissionsSeeder');
exports.permissions = [
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
async function seedPermissionsIfNotExist() {
    logger.log('Checking permissions...');
    for (const permission of exports.permissions) {
        const existingPermission = await prisma.permission.findUnique({
            where: {
                name: permission.name,
            },
        });
        if (existingPermission) {
            logger.warn(`Permiso '${permission.name}' ya existe. No se creará un duplicado.`);
        }
        else {
            await prisma.permission.create({
                data: permission,
            });
            logger.log(`Permiso '${permission.name}' creado exitosamente.`);
        }
    }
    logger.log('Verificación y creación de permisos completada.');
}
//# sourceMappingURL=permissions.seeder.js.map