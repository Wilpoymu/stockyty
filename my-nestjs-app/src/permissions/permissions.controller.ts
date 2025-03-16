import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';

@Controller('api/permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  // Endpoints para CRUD básico de permisos
  @Post()
  create(@Body() createPermissionDto: CreatePermissionDto) {
    return this.permissionsService.create(createPermissionDto);
  }

  @Get()
  findAll() {
    return this.permissionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.permissionsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ) {
    return this.permissionsService.update(id, updatePermissionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.permissionsService.remove(id);
  }

  // Endpoints específicos para la gestión de permisos en roles
  @Post(':id/assign-to-role/:roleId')
  assignToRole(
    @Param('id') permissionId: string,
    @Param('roleId') roleId: string,
  ) {
    return this.permissionsService.assignToRole(permissionId, roleId);
  }

  @Delete(':id/remove-from-role/:roleId')
  removeFromRole(
    @Param('id') permissionId: string,
    @Param('roleId') roleId: string,
  ) {
    return this.permissionsService.removeFromRole(permissionId, roleId);
  }

  @Get('check/:permissionName/role/:roleId')
  checkPermission(
    @Param('permissionName') permissionName: string,
    @Param('roleId') roleId: string,
  ) {
    return this.permissionsService.checkPermission(permissionName, roleId);
  }

  @Get('role/:roleId')
  getPermissionsByRoleId(@Param('roleId') roleId: string) {
    return this.permissionsService.getPermissionsByRoleId(roleId);
  }

  @Get(':id/roles')
  getRolesByPermissionId(@Param('id') id: string) {
    return this.permissionsService.getRolesByPermissionId(id);
  }
}
