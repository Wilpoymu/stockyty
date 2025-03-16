import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * @module PrismaModule
 * @description Global module that provides the PrismaService for database interactions.
 * All modules can import this module to access the PrismaService.
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
