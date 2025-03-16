import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import { CreateUserDto } from '../users/dto/create-user.dto';
export declare class AuthService {
    private prisma;
    private jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    validateUser(email: string, password: string): Promise<Omit<User, 'password'>>;
    login(user: Omit<User, 'password'>): Promise<{
        access_token: string;
        user: {
            id: string;
            email: string;
            username: string;
            firstname: string;
            lastname: string;
            roles: string[];
        };
    }>;
    register(createUserDto: CreateUserDto): Promise<{
        id: string;
        firstname: string;
        lastname: string;
        username: string;
        email: string;
        phone: string;
        status: number;
        avatar: string | null;
        documentNumber: string;
        address: string;
        resetToken: string | null;
        resetTokenExpiry: Date | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }>;
    validateToken(token: string): Promise<{
        isValid: boolean;
        user: {
            id: string;
            email: string;
            username: string;
        };
        message?: undefined;
    } | {
        isValid: boolean;
        message: string;
        user?: undefined;
    }>;
    forgotPassword(email: string): Promise<{
        message: string;
        resetToken?: undefined;
    } | {
        message: string;
        resetToken: string;
    }>;
    resetPassword(token: string, newPassword: string): Promise<{
        message: string;
    }>;
    getProfile(userId: string): Promise<{
        id: string;
        email: string;
        username: string;
        firstname: string;
        lastname: string;
        phone: string;
        status: number;
        avatar: string | null;
        documentNumber: string;
        address: string;
        createdAt: Date;
        updatedAt: Date;
        roles: string[];
    }>;
    changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{
        message: string;
    }>;
}
