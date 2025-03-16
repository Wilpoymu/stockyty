import { AppService } from './app.service';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    getHello(): string;
    getStatus(): {
        status: string;
        timestamp: string;
        version: string;
        environment: string;
        apiName: string;
        documentation: string;
    };
}
