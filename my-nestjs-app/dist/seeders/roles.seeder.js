"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedRolesIfNotExist = seedRolesIfNotExist;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function seedRolesIfNotExist() {
    const count = await prisma.role.count();
    if (count >= 4)
        return;
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
//# sourceMappingURL=roles.seeder.js.map