"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedAgendaPermissionsIfNotExist = seedAgendaPermissionsIfNotExist;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function seedAgendaPermissionsIfNotExist() {
    const agendaPermissions = [
        {
            name: 'agenda.view',
            label: 'Ver eventos de agenda',
            description: 'Permite ver los eventos de agenda asignados',
        },
        {
            name: 'agenda.create',
            label: 'Crear eventos de agenda',
            description: 'Permite crear nuevos eventos en la agenda',
        },
        {
            name: 'agenda.update',
            label: 'Actualizar eventos de agenda',
            description: 'Permite actualizar eventos existentes en la agenda',
        },
        {
            name: 'agenda.delete',
            label: 'Eliminar eventos de agenda',
            description: 'Permite eliminar eventos de la agenda',
        },
        {
            name: 'agenda.manage',
            label: 'Gestionar todos los eventos de agenda',
            description: 'Permite gestionar todos los eventos de agenda, incluso los no asignados',
        },
        {
            name: 'agenda.assign',
            label: 'Asignar empleados a eventos',
            description: 'Permite asignar empleados a eventos de la agenda',
        },
    ];
    for (const permission of agendaPermissions) {
        const existingPermission = await prisma.permission.findUnique({
            where: { name: permission.name },
        });
        if (!existingPermission) {
            await prisma.permission.create({
                data: permission,
            });
            console.log(`Created permission: ${permission.name}`);
        }
    }
    await assignAgendaPermissionsToRoles();
    console.log('Agenda permissions seeded successfully');
}
async function assignAgendaPermissionsToRoles() {
    const adminRole = await prisma.role.findFirst({
        where: { name: 'ADMIN' },
    });
    const managerRole = await prisma.role.findFirst({
        where: { name: 'MANAGER' },
    });
    const employeeRole = await prisma.role.findFirst({
        where: { name: 'EMPLOYEE' },
    });
    if (!adminRole || !managerRole || !employeeRole) {
        console.log('Required roles not found, skipping permission assignment');
        return;
    }
    const agendaPermissions = await prisma.permission.findMany({
        where: {
            name: {
                startsWith: 'agenda.',
            },
        },
    });
    for (const permission of agendaPermissions) {
        const existingPermission = await prisma.rolePermission.findFirst({
            where: {
                roleId: adminRole.id,
                permissionId: permission.id,
            },
        });
        if (!existingPermission) {
            await prisma.rolePermission.create({
                data: {
                    roleId: adminRole.id,
                    permissionId: permission.id,
                },
            });
        }
    }
    for (const permission of agendaPermissions) {
        if (permission.name !== 'agenda.delete') {
            const existingPermission = await prisma.rolePermission.findFirst({
                where: {
                    roleId: managerRole.id,
                    permissionId: permission.id,
                },
            });
            if (!existingPermission) {
                await prisma.rolePermission.create({
                    data: {
                        roleId: managerRole.id,
                        permissionId: permission.id,
                    },
                });
            }
        }
    }
    const employeePermissions = agendaPermissions.filter((p) => p.name === 'agenda.view' || p.name === 'agenda.update');
    for (const permission of employeePermissions) {
        const existingPermission = await prisma.rolePermission.findFirst({
            where: {
                roleId: employeeRole.id,
                permissionId: permission.id,
            },
        });
        if (!existingPermission) {
            await prisma.rolePermission.create({
                data: {
                    roleId: employeeRole.id,
                    permissionId: permission.id,
                },
            });
        }
    }
    console.log('Agenda permissions assigned to roles successfully');
}
//# sourceMappingURL=agenda.seeder.js.map