import { PrismaService } from '../prisma/prisma.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
export declare class PermissionsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(createPermissionDto: CreatePermissionDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        label: string | null;
        description: string | null;
    }>;
    findAll(): Promise<({
        rolePermissions: ({
            role: {
                id: string;
                status: number;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                name: string;
                label: string | null;
                description: string | null;
            };
        } & {
            id: string;
            roleId: string;
            permissionId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        label: string | null;
        description: string | null;
    })[]>;
    findOne(id: string): Promise<({
        rolePermissions: ({
            role: {
                id: string;
                status: number;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                name: string;
                label: string | null;
                description: string | null;
            };
        } & {
            id: string;
            roleId: string;
            permissionId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        label: string | null;
        description: string | null;
    }) | null>;
    update(id: string, updatePermissionDto: UpdatePermissionDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        label: string | null;
        description: string | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        label: string | null;
        description: string | null;
    }>;
    assignToRole(permissionId: string, roleId: string): Promise<{
        id: string;
        roleId: string;
        permissionId: string;
    }>;
    removeFromRole(permissionId: string, roleId: string): Promise<import("@prisma/client").Prisma.BatchPayload>;
    checkPermission(permissionName: string, roleId: string): Promise<boolean>;
    getPermissionsByRoleId(roleId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        label: string | null;
        description: string | null;
    }[]>;
    getRolesByPermissionId(permissionId: string): Promise<{
        id: string;
        status: number;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        name: string;
        label: string | null;
        description: string | null;
    }[]>;
}
