import { PartialType } from '@nestjs/mapped-types';
import { CreateRoleDto } from './create-role.dto';

/**
 * @class UpdateRoleDto
 * @extends PartialType(CreateRoleDto)
 * @description Data Transfer Object for updating a role.
 * This DTO makes all properties of CreateRoleDto optional.
 */
export class UpdateRoleDto extends PartialType(CreateRoleDto) {}
