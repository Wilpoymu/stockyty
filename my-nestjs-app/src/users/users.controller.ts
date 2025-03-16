import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

/**
 * @class UsersController
 * @description Controller for handling HTTP requests related to users.
 */
@Controller('api/users')
export class UsersController {
  /**
   * Creates an instance of UsersController.
   * @param {UsersService} usersService - Users service instance.
   */
  constructor(private readonly usersService: UsersService) {}

  /**
   * Handles the creation of a new user.
   * @param {CreateUserDto} createUserDto - Data Transfer Object containing user's creation data.
   * @returns {Promise<any>} A promise that resolves with the created user.
   */
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  /**
   * Retrieves all users.
   * @returns {Promise<any[]>} A promise that resolves with an array of users.
   */
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  /**
   * Retrieves a single user by its unique identifier.
   * @param {string} id - The identifier of the user.
   * @returns {Promise<any>} A promise that resolves with the user if found.
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  /**
   * Updates an existing user.
   * @param {string} id - The identifier of the user.
   * @param {UpdateUserDto} updateUserDto - Data Transfer Object containing updated user data.
   * @returns {Promise<any>} A promise that resolves with the updated user.
   */
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  /**
   * Deletes a user by its unique identifier.
   * @param {string} id - The identifier of the user.
   * @returns {Promise<any>} A promise that resolves with the deleted user.
   */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
