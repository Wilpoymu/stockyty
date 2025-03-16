import { Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    private prismaService;
    private configService;
    constructor(prismaService: PrismaService, configService: ConfigService);
    validate(payload: any): Promise<{
        id: string;
        email: string;
        username: string;
        roles: string[];
        roleUsers: ({
            role: {
                id: string;
                status: number;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                name: string;
                label: string | null;
                description: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            roleId: string;
        })[];
    }>;
}
export {};
