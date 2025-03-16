import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './auth/decorators/public.decorator';

/**
 * @class AppController
 * @description Main application controller that handles basic routes
 */
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * Health check endpoint to verify the API is running
   * @returns {string} A welcome message indicating the API is working
   */
  @Public()
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  /**
   * Status endpoint for monitoring services
   * @returns {object} Object containing the status information
   */
  @Public()
  @Get('status')
  getStatus() {
    return this.appService.getStatus();
  }
}
