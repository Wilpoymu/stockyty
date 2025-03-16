"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt_util_1 = require("../utils/bcrypt.util");
const crypto_1 = require("crypto");
let AuthService = class AuthService {
    constructor(prisma, jwtService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
    }
    async validateUser(email, password) {
        const user = await this.prisma.user.findUnique({
            where: { email },
            include: {
                roleUsers: {
                    include: { role: true },
                },
            },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Credenciales inválidas');
        }
        const isPasswordValid = await (0, bcrypt_util_1.comparePassword)(password, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Credenciales inválidas');
        }
        if (user.status !== 1) {
            throw new common_1.UnauthorizedException('Usuario inactivo');
        }
        const { password: _password, ...result } = user;
        return result;
    }
    async login(user) {
        const userData = await this.prisma.user.findUnique({
            where: { id: user.id },
            include: {
                roleUsers: {
                    include: { role: true },
                },
            },
        });
        if (!userData) {
            throw new common_1.UnauthorizedException('Usuario no encontrado');
        }
        const roles = userData.roleUsers.map((ru) => ru.role.name);
        const payload = {
            sub: user.id,
            email: user.email,
            username: user.username,
            roles,
        };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                firstname: user.firstname,
                lastname: user.lastname,
                roles,
            },
        };
    }
    async register(createUserDto) {
        try {
            const userData = {
                ...createUserDto,
                role_id: createUserDto.role_id || '4',
            };
            const { firstname, lastname, username, email, password, phone, status, avatar, role_id, documentNumber, address, } = userData;
            const existingUser = await this.prisma.user.findFirst({
                where: {
                    OR: [{ email }, { documentNumber }],
                },
            });
            if (existingUser) {
                throw new Error('El usuario ya está registrado');
            }
            const role = await this.prisma.role.findUnique({
                where: { id: role_id },
            });
            if (!role) {
                throw new Error(`Role with id ${role_id} not found`);
            }
            const hashedPassword = await (0, bcrypt_util_1.hashPassword)(password);
            const user = await this.prisma.user.create({
                data: {
                    firstname,
                    lastname,
                    username,
                    email,
                    password: hashedPassword,
                    phone,
                    status,
                    avatar,
                    documentNumber,
                    address,
                    roleUsers: {
                        create: {
                            role: {
                                connect: { id: role_id },
                            },
                        },
                    },
                },
            });
            const { password: _, ...result } = user;
            return result;
        }
        catch (error) {
            if (error instanceof Error) {
                throw new common_1.BadRequestException(error.message);
            }
            else {
                throw new common_1.BadRequestException('An unexpected error occurred.');
            }
        }
    }
    async validateToken(token) {
        try {
            const payload = this.jwtService.verify(token);
            const user = await this.prisma.user.findUnique({
                where: { id: payload.sub },
                include: {
                    roleUsers: {
                        include: { role: true },
                    },
                },
            });
            if (!user || user.status !== 1) {
                throw new common_1.UnauthorizedException('Token inválido o usuario inactivo');
            }
            return {
                isValid: true,
                user: {
                    id: user.id,
                    email: user.email,
                    username: user.username,
                },
            };
        }
        catch {
            return {
                isValid: false,
                message: 'Token inválido o expirado',
            };
        }
    }
    async forgotPassword(email) {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user) {
            return {
                message: 'Si el correo existe, recibirá instrucciones para restablecer su contraseña',
            };
        }
        const resetToken = (0, crypto_1.randomBytes)(32).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 3600000);
        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                resetToken,
                resetTokenExpiry,
            },
        });
        return {
            message: 'Instrucciones enviadas al correo electrónico',
            resetToken,
        };
    }
    async resetPassword(token, newPassword) {
        const user = await this.prisma.user.findFirst({
            where: {
                resetToken: token,
                resetTokenExpiry: {
                    gt: new Date(),
                },
            },
        });
        if (!user) {
            throw new common_1.BadRequestException('Token inválido o expirado');
        }
        const hashedPassword = await (0, bcrypt_util_1.hashPassword)(newPassword);
        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetToken: null,
                resetTokenExpiry: null,
            },
        });
        return { message: 'Contraseña restablecida con éxito' };
    }
    async getProfile(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                roleUsers: {
                    include: { role: true },
                },
            },
        });
        if (!user) {
            throw new common_1.NotFoundException('Usuario no encontrado');
        }
        const roles = user.roleUsers.map((ru) => ru.role.name);
        return {
            id: user.id,
            email: user.email,
            username: user.username,
            firstname: user.firstname,
            lastname: user.lastname,
            phone: user.phone,
            status: user.status,
            avatar: user.avatar,
            documentNumber: user.documentNumber,
            address: user.address,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            roles,
        };
    }
    async changePassword(userId, currentPassword, newPassword) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException('Usuario no encontrado');
        }
        const isPasswordValid = await (0, bcrypt_util_1.comparePassword)(currentPassword, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('La contraseña actual es incorrecta');
        }
        const hashedPassword = await (0, bcrypt_util_1.hashPassword)(newPassword);
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                password: hashedPassword,
            },
        });
        return { message: 'Contraseña cambiada con éxito' };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map