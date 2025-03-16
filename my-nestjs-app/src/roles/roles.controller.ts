import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

/**
 * @class RolesController
 * @description Controller for handling HTTP requests related to roles.
 */
@Controller('api/roles')
export class RolesController {
  /**
   * Creates an instance of RolesController.
   * @param {RolesService} rolesService - Service for managing roles.
   */
  constructor(private readonly rolesService: RolesService) {}

  /**
   * Handles the creation of a new role.
   * @param {CreateRoleDto} createRoleDto - Data Transfer Object with role creation data.
   * @returns {Promise<any>} A promise that resolves with the created role.
   */
  @Post()
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto);
  }

  /**
   * Retrieves all roles.
   * @returns {Promise<any[]>} A promise that resolves with an array of roles.
   */
  @Get()
  findAll() {
    return this.rolesService.findAll();
  }

  /**
   * Retrieves a single role by its unique identifier.
   * @param {string} id - The ID of the role.
   * @returns {Promise<any>} A promise that resolves with the role if found.
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(id);
  }

  /**
   * Updates an existing role.
   * @param {string} id - The ID of the role to update.
   * @param {UpdateRoleDto} updateRoleDto - Data Transfer Object containing updated role data.
   * @returns {Promise<any>} A promise that resolves with the updated role.
   */
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.rolesService.update(id, updateRoleDto);
  }

  /**
   * Removes a role by its unique identifier.
   * @param {string} id - The ID of the role to remove.
   * @returns {Promise<any>} A promise that resolves with the removed role.
   */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.rolesService.remove(id);
  }
}
