import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from '../prisma/prisma.module';

/**
 * @module UsersModule
 * @description Module for managing users in the system. This module bundles the UsersController and UsersService,
 * and imports the PrismaModule for database interactions.
 */
@Module({
  imports: [PrismaModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
