import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';

@Injectable()
export class PermissionsService {
  constructor(private readonly prisma: PrismaService) {}

  // CRUD para permisos individuales
  async create(createPermissionDto: CreatePermissionDto) {
    // Verificar si ya existe un permiso con el mismo nombre
    const existingPermission = await this.prisma.permission.findUnique({
      where: { name: createPermissionDto.name },
    });

    // Si existe, lanzar una excepción
    if (existingPermission) {
      throw new ConflictException(
        `Ya existe un permiso con el nombre '${createPermissionDto.name}'`,
      );
    }

    // Si no existe, proceder a crear el permiso
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

  async findOne(id: string) {
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

  async update(id: string, updatePermissionDto: UpdatePermissionDto) {
    return await this.prisma.permission.update({
      where: { id },
      data: updatePermissionDto,
    });
  }

  async remove(id: string) {
    return await this.prisma.permission.delete({
      where: { id },
    });
  }

  // Métodos específicos para la asignación de permisos a roles
  async assignToRole(permissionId: string, roleId: string) {
    return await this.prisma.rolePermission.create({
      data: {
        permissionId,
        roleId,
      },
    });
  }

  async removeFromRole(permissionId: string, roleId: string) {
    return await this.prisma.rolePermission.deleteMany({
      where: {
        permissionId,
        roleId,
      },
    });
  }

  // Métodos para verificar permisos (similares a los del modelo PHP)
  async checkPermission(
    permissionName: string,
    roleId: string,
  ): Promise<boolean> {
    const count = await this.prisma.rolePermission.count({
      where: {
        role: { id: roleId },
        permission: { name: permissionName },
      },
    });
    return count > 0;
  }

  // Método para obtener todos los permisos asignados a un rol
  async getPermissionsByRoleId(roleId: string) {
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

    return (
      roleWithPermissions?.rolePermissions.map((rp) => rp.permission) || []
    );
  }

  // Método para obtener todos los roles que tienen un permiso específico
  async getRolesByPermissionId(permissionId: string) {
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
}
