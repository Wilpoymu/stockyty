/**
 * @module RolesModule
 * @description Module for managing roles in the system. This module bundles the roles service and controller.
 */
import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';

/**
 * @class RolesModule
 * @description NestJS module that encapsulates roles functionality.
 */
@Module({
  controllers: [RolesController],
  providers: [RolesService],
})
export class RolesModule {}
