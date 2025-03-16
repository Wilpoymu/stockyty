/**
 * @module RolesService
 * @description Service for managing roles in the system.
 */
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  /**
   * Creates an instance of RolesService.
   * @param {PrismaService} prisma - The Prisma service instance.
   */
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Creates a new role if it does not already exist.
   *
   * @param {CreateRoleDto} createRoleDto - The DTO containing role creation information.
   * @returns {Promise<any>} A promise that resolves with the created role.
   * @throws {BadRequestException} If a role with the same name already exists.
   */
  async create(createRoleDto: CreateRoleDto) {
    const existingRole = await this.prisma.role.findUnique({
      where: { name: createRoleDto.name },
    });
    if (existingRole) {
      throw new BadRequestException('El rol con ese nombre ya existe');
    }
    return this.prisma.role.create({
      data: createRoleDto,
    });
  }

  /**
   * Retrieves a list of all roles.
   *
   * @returns {Promise<any[]>} A promise that resolves with an array of roles.
   */
  findAll() {
    return this.prisma.role.findMany();
  }

  /**
   * Retrieves a single role by its unique identifier.
   *
   * @param {string} id - The ID of the role.
   * @returns {Promise<any>} A promise that resolves with the role, if found.
   */
  findOne(id: string) {
    return this.prisma.role.findUnique({
      where: { id },
    });
  }

  /**
   * Updates an existing role.
   *
   * @param {string} id - The ID of the role to update.
   * @param {UpdateRoleDto} updateRoleDto - The DTO containing updated role information.
   * @returns {Promise<any>} A promise that resolves with the updated role.
   */
  update(id: string, updateRoleDto: UpdateRoleDto) {
    return this.prisma.role.update({
      where: { id },
      data: updateRoleDto,
    });
  }

  /**
   * Removes a role by its unique identifier.
   *
   * @param {string} id - The ID of the role to remove.
   * @returns {Promise<any>} A promise that resolves with the removed role.
   */
  remove(id: string) {
    return this.prisma.role.delete({
      where: { id },
    });
  }
}
