import { Injectable } from '@nestjs/common';

/**
 * @class AppService
 * @description Main application service that provides base functionality
 */
@Injectable()
export class AppService {
  /**
   * Returns a welcome message for the API
   * @returns {string} Welcome message
   */
  getHello(): string {
    return 'Welcome to the Stocky API - Your inventory management solution';
  }

  /**
   * Returns the current status of the API and basic information
   * @returns {object} Object containing status information
   */
  getStatus() {
    return {
      status: 'online',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      apiName: 'Stocky Ultimate API',
      documentation: '/api/docs', // Si implementas Swagger posteriormente
    };
  }
}
