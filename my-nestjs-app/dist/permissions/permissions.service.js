"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let PermissionsService = class PermissionsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createPermissionDto) {
        const existingPermission = await this.prisma.permission.findUnique({
            where: { name: createPermissionDto.name },
        });
        if (existingPermission) {
            throw new common_1.ConflictException(`Ya existe un permiso con el nombre '${createPermissionDto.name}'`);
        }
        return await this.prisma.permission.create({
            data: createPermissionDto,
        });
    }
    async findAll() {
        return await this.prisma.permission.findMany({
            include: {
                rolePermissions: {
                    include: {
                        role: true,
                    },
                },
            },
        });
    }
    async findOne(id) {
        return await this.prisma.permission.findUnique({
            where: { id },
            include: {
                rolePermissions: {
                    include: {
                        role: true,
                    },
                },
            },
        });
    }
    async update(id, updatePermissionDto) {
        return await this.prisma.permission.update({
            where: { id },
            data: updatePermissionDto,
        });
    }
    async remove(id) {
        return await this.prisma.permission.delete({
            where: { id },
        });
    }
    async assignToRole(permissionId, roleId) {
        return await this.prisma.rolePermission.create({
            data: {
                permissionId,
                roleId,
            },
        });
    }
    async removeFromRole(permissionId, roleId) {
        return await this.prisma.rolePermission.deleteMany({
            where: {
                permissionId,
                roleId,
            },
        });
    }
    async checkPermission(permissionName, roleId) {
        const count = await this.prisma.rolePermission.count({
            where: {
                role: { id: roleId },
                permission: { name: permissionName },
            },
        });
        return count > 0;
    }
    async getPermissionsByRoleId(roleId) {
        const roleWithPermissions = await this.prisma.role.findUnique({
            where: { id: roleId },
            include: {
                rolePermissions: {
                    include: {
                        permission: true,
                    },
                },
            },
        });
        return (roleWithPermissions?.rolePermissions.map((rp) => rp.permission) || []);
    }
    async getRolesByPermissionId(permissionId) {
        const permissionWithRoles = await this.prisma.permission.findUnique({
            where: { id: permissionId },
            include: {
                rolePermissions: {
                    include: {
                        role: true,
                    },
                },
            },
        });
        return permissionWithRoles?.rolePermissions.map((rp) => rp.role) || [];
    }
};
exports.PermissionsService = PermissionsService;
exports.PermissionsService = PermissionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PermissionsService);
//# sourceMappingURL=permissions.service.js.map