import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
interface RequestWithUser extends Request {
    user: {
        id: string;
        email: string;
        username: string;
        roles: string[];
    };
}
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(loginDto: {
        email: string;
        password: string;
    }): Promise<{
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
    validateToken(tokenDto: {
        token: string;
    }): Promise<{
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
    forgotPassword(emailDto: {
        email: string;
    }): Promise<{
        message: string;
        resetToken?: undefined;
    } | {
        message: string;
        resetToken: string;
    }>;
    resetPassword(resetDto: {
        token: string;
        newPassword: string;
    }): Promise<{
        message: string;
    }>;
    getProfile(req: RequestWithUser): Promise<{
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
    changePassword(req: RequestWithUser, passwordDto: {
        currentPassword: string;
        newPassword: string;
    }): Promise<{
        message: string;
    }>;
}
export {};
