export declare class AppService {
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
