import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * @class PrismaService
 * @description Service that handles connection management to the database via PrismaClient.
 * It implements OnModuleInit and OnModuleDestroy to manage the lifecycle of the database connection.
 */
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  /**
   * Called once the module has been initialized.
   * Establishes a connection to the database.
   *
   * @async
   * @returns {Promise<void>} A promise that resolves when the connection is successfully established.
   */
  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  /**
   * Called once the module is about to be destroyed.
   * Closes the connection to the database.
   *
   * @async
   * @returns {Promise<void>} A promise that resolves when the connection is successfully closed.
   */
  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
