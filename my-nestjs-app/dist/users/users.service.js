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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt_util_1 = require("../utils/bcrypt.util");
let UsersService = class UsersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createUserDto) {
        const { firstname, lastname, username, email, password, phone, status, avatar, role_id, documentNumber, address, } = createUserDto;
        const existingUser = await this.prisma.user.findFirst({
            where: {
                OR: [{ email }, { documentNumber }],
            },
        });
        if (existingUser) {
            throw new Error('El usuario ya está registrado');
        }
        const effectiveRoleId = role_id || '3';
        const prismaClient = this
            .prisma;
        const role = await prismaClient.role.findUnique({
            where: { id: effectiveRoleId },
        });
        if (!role) {
            throw new Error(`Role with id ${effectiveRoleId} not found`);
        }
        const hashedPassword = await (0, bcrypt_util_1.hashPassword)(password);
        try {
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
                                connect: {
                                    id: effectiveRoleId,
                                },
                            },
                        },
                    },
                },
            });
            return user;
        }
        catch (error) {
            const prismaError = error;
            if (prismaError.code === 'P2002') {
                const target = Array.isArray(prismaError.meta?.target)
                    ? prismaError.meta.target
                    : [];
                if (target.includes('User_email_key')) {
                    throw new Error('El email/nombre de usuario ya está registrado');
                }
                if (target.includes('User_username_key')) {
                    throw new Error('El email/nombre de usuario ya está registrado');
                }
                throw new Error(`Unique constraint failed on: ${target.join(', ') || 'unknown field'}`);
            }
            throw error;
        }
    }
    findAll() {
        return this.prisma.user.findMany({
            include: {
                roleUsers: {
                    include: { role: true },
                },
            },
        });
    }
    findOne(id) {
        return this.prisma.user.findUnique({
            where: { id },
            include: {
                roleUsers: {
                    include: { role: true },
                },
            },
        });
    }
    async update(id, updateUserDto) {
        const userData = {
            ...updateUserDto,
            password: updateUserDto.password
                ? await (0, bcrypt_util_1.hashPassword)(updateUserDto.password)
                : undefined,
        };
        const updatedUser = await this.prisma.user.update({
            where: { id },
            data: userData,
        });
        return updatedUser;
    }
    remove(id) {
        return this.prisma.user.delete({
            where: { id },
        });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map