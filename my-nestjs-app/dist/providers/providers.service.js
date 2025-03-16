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
exports.ProvidersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ProvidersService = class ProvidersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createProviderDto) {
        const { name, code, email, phone, country, city, address, status, contactName, taxNumber, } = createProviderDto;
        if (!name || !email || !phone || !address || !contactName) {
            throw new common_1.BadRequestException('Todos los campos son obligatorios');
        }
        const existingProvider = await this.prisma.provider.findFirst({
            where: {
                OR: [{ email }, { contactName }],
            },
        });
        if (existingProvider) {
            throw new common_1.BadRequestException('El proveedor ya está registrado');
        }
        try {
            const provider = await this.prisma.provider.create({
                data: {
                    name,
                    code,
                    email,
                    phone,
                    country,
                    city,
                    status,
                    address,
                    contactName,
                    taxNumber,
                },
            });
            return provider;
        }
        catch (error) {
            const prismaError = error;
            if (prismaError.code === 'P2002') {
                const target = Array.isArray(prismaError.meta?.target)
                    ? prismaError.meta.target
                    : [];
                if (target.includes('Provider_email_key')) {
                    throw new common_1.BadRequestException('El email del proveedor ya está registrado');
                }
                if (target.includes('Provider_documentNumber_key')) {
                    throw new common_1.BadRequestException('El número de documento del proveedor ya está registrado');
                }
                throw new common_1.BadRequestException(`Unique constraint failed on: ${target.join(', ') || 'unknown field'}`);
            }
            throw error;
        }
    }
    async findAll() {
        const providers = await this.prisma.provider.findMany();
        if (providers.length === 0) {
            throw new common_1.NotFoundException('No se encontraron proveedores');
        }
        return providers;
    }
    async findOne(id) {
        if (!id) {
            throw new common_1.BadRequestException('El ID es obligatorio');
        }
        const provider = await this.prisma.provider.findUnique({
            where: { id },
        });
        if (!provider) {
            throw new common_1.NotFoundException('Proveedor no encontrado');
        }
        return provider;
    }
    async update(id, updateProviderDto) {
        if (!id) {
            throw new common_1.BadRequestException('El ID es obligatorio');
        }
        const existingProvider = await this.prisma.provider.findUnique({
            where: { id },
        });
        if (!existingProvider) {
            throw new common_1.NotFoundException('Proveedor no encontrado');
        }
        if (Object.keys(updateProviderDto).length === 0) {
            throw new common_1.BadRequestException('No hay datos para actualizar');
        }
        return this.prisma.provider.update({
            where: { id },
            data: updateProviderDto,
        });
    }
    async remove(id) {
        if (!id) {
            throw new common_1.BadRequestException('El ID es obligatorio');
        }
        const existingProvider = await this.prisma.provider.findUnique({
            where: { id },
        });
        if (!existingProvider) {
            throw new common_1.NotFoundException('Proveedor no encontrado');
        }
        return this.prisma.provider.delete({
            where: { id },
        });
    }
};
exports.ProvidersService = ProvidersService;
exports.ProvidersService = ProvidersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProvidersService);
//# sourceMappingURL=providers.service.js.map