import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { hashPassword } from '../utils/bcrypt.util';
import { User } from '@prisma/client';

/**
 * @interface PrismaError
 * @description Interface representing a potential Prisma error.
 */
interface PrismaError {
  code?: string;
  meta?: {
    target?: string[];
    [key: string]: any;
  };
}

/**
 * @class UsersService
 * @description Service for managing users in the system.
 */
@Injectable()
export class UsersService {
  /**
   * Creates an instance of UsersService.
   * @param {PrismaService} prisma - The Prisma service instance.
   */
  constructor(private prisma: PrismaService) {}

  /**
   * Creates a new user.
   *
   * This function validates that the user is not already registered based on email or document number,
   * verifies the existence of the role, hashes the user's password, and creates the user with a nested
   * relation to roleUsers.
   *
   * @param {CreateUserDto} createUserDto - The DTO containing user's creation information.
   * @returns {Promise<User>} A promise that resolves with the created user.
   * @throws {Error} If the user already exists, if the role is not found, or if a unique constraint fails.
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    const {
      firstname,
      lastname,
      username,
      email,
      password,
      phone,
      status,
      avatar,
      role_id,
      documentNumber,
      address,
    } = createUserDto;

    // Validate that the user is not already registered based on email or document number.
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email }, { documentNumber }],
      },
    });
    if (existingUser) {
      throw new Error('El usuario ya está registrado');
    }

    // Assign the "EMPLOYEE" role by default if role_id is not provided.
    const effectiveRoleId = role_id || '3';

    // Verify that the role exists.
    const prismaClient = this
      .prisma as unknown as import('@prisma/client').PrismaClient;
    const role = await prismaClient.role.findUnique({
      where: { id: effectiveRoleId },
    });
    if (!role) {
      throw new Error(`Role with id ${effectiveRoleId} not found`);
    }

    // Hash the user's password.
    const hashedPassword = await hashPassword(password);

    try {
      // Create the user in the database with a nested relation to roleUsers.
      const user = await this.prisma.user.create({
        data: {
          firstname,
          lastname,
          username,
          email,
          password: hashedPassword,
          phone,
          status,
          avatar,
          documentNumber, // send document
          address, // send address
          roleUsers: {
            create: {
              role: {
                connect: {
                  id: effectiveRoleId,
                },
              },
            },
          },
        },
      });
      return user;
    } catch (error: unknown) {
      const prismaError = error as PrismaError;
      if (prismaError.code === 'P2002') {
        const target = Array.isArray(prismaError.meta?.target)
          ? prismaError.meta.target
          : [];
        if (target.includes('User_email_key')) {
          throw new Error('El email/nombre de usuario ya está registrado');
        }
        if (target.includes('User_username_key')) {
          throw new Error('El email/nombre de usuario ya está registrado');
        }
        throw new Error(
          `Unique constraint failed on: ${target.join(', ') || 'unknown field'}`,
        );
      }
      throw error;
    }
  }

  /**
   * Retrieves all users.
   *
   * @returns {Promise<User[]>} A promise that resolves with an array of users, including their roles.
   */
  findAll(): Promise<User[]> {
    return this.prisma.user.findMany({
      include: {
        roleUsers: {
          include: { role: true },
        },
      },
    });
  }

  /**
   * Retrieves a user by its unique identifier.
   *
   * @param {string} id - The identifier of the user.
   * @returns {Promise<User | null>} A promise that resolves with the user if found, or null otherwise.
   */
  findOne(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        roleUsers: {
          include: { role: true },
        },
      },
    });
  }

  /**
   * Updates an existing user.
   *
   * If the update DTO contains a new password, the password is hashed before being updated.
   *
   * @param {string} id - The identifier of the user to update.
   * @param {UpdateUserDto} updateUserDto - The DTO containing updated user data.
   * @returns {Promise<User>} A promise that resolves with the updated user.
   */
  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    // Create a new object instead of modifying the DTO directly
    const userData = {
      ...updateUserDto,
      password: updateUserDto.password
        ? await hashPassword(updateUserDto.password)
        : undefined,
    };

    // Use userData instead of updateUserDto for the update operation
    // Remove the line: updateUserDto.password = await hashPassword(updateUserDto.password);

    // Then continue with the update operation using userData
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: userData,
    });
    return updatedUser;
  }

  /**
   * Removes a user by its unique identifier.
   *
   * @param {string} id - The identifier of the user to remove.
   * @returns {Promise<User>} A promise that resolves with the deleted user.
   */
  remove(id: string): Promise<User> {
    return this.prisma.user.delete({
      where: { id },
    });
  }
}
