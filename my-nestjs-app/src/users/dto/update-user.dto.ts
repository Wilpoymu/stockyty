import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

/**
 * @class UpdateUserDto
 * @extends PartialType(CreateUserDto)
 * @description Data Transfer Object for updating a user.
 * This DTO makes all properties of CreateUserDto optional.
 */
export class UpdateUserDto extends PartialType(CreateUserDto) {}
