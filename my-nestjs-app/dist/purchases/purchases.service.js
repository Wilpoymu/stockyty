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
exports.PurchasesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let PurchasesService = class PurchasesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createPurchaseDto) {
        const { id, date, ref, providerId, total, taxRate, shipping, discount, notes, taxNet, paidAmount, paymentStatus, status, grandTotal, paymentType, createdAt, updatedAt, deletedAt, userId, details, payments, } = createPurchaseDto;
        this.validateRequiredFields(createPurchaseDto);
        this.validateNonNegativeValues(createPurchaseDto);
        const existingPurchase = await this.prisma.purchase.findFirst({
            where: {
                ref,
            },
        });
        if (existingPurchase) {
            throw new Error('La compra ya está registrada');
        }
        try {
            const purchase = await this.prisma.purchase.create({
                data: {
                    id,
                    date,
                    ref,
                    total: this.parseNumber(total) ?? 0,
                    taxRate: this.parseNumber(taxRate) ?? 0,
                    shipping: this.parseNumber(shipping) ?? 0,
                    discount: this.parseNumber(discount) ?? 0,
                    notes: notes ?? '',
                    taxNet: this.parseNumber(taxNet) ?? 0,
                    paidAmount: this.parseNumber(paidAmount) ?? 0,
                    paymentStatus: paymentStatus ?? 'PENDING',
                    status: this.parseNumber(status) ?? 1,
                    grandTotal: this.parseNumber(grandTotal) ?? 0,
                    paymentType,
                    createdAt,
                    updatedAt,
                    deletedAt,
                    providerId,
                    userId,
                    details: {
                        create: details.map((detail) => ({
                            product: { connect: { id: detail.productId } },
                            quantity: detail.quantity,
                            price: detail.price,
                            taxNet: detail.taxNet,
                            discount: detail.discount,
                            discountMethod: detail.discountMethod,
                            taxMethod: detail.taxMethod,
                            purchaseUnitId: detail.purchaseUnitId ?? null,
                            total: detail.total ?? null,
                            productVariantId: detail.productVariantId ?? null,
                        })),
                    },
                    facture: {
                        create: payments?.map((payment) => ({
                            amount: payment.amount,
                            charge: payment.charge,
                            ref: payment.ref,
                            reglement: payment.reglement,
                            userId: payment.userId,
                            date: payment.date,
                            notes: payment.notes,
                            accountId: payment.accountId ?? undefined,
                        })),
                    },
                },
                include: {
                    user: true,
                    provider: true,
                    details: true,
                    facture: true,
                },
            });
            return purchase;
        }
        catch (error) {
            console.error('Error al crear la compra:', error);
            throw new common_1.InternalServerErrorException(error.message);
        }
    }
    async findAll() {
        const purchases = await this.prisma.purchase.findMany({
            include: {
                user: true,
                provider: true,
                details: true,
                facture: true,
            },
        });
        if (purchases.length === 0) {
            throw new common_1.NotFoundException('No se encontraron compras');
        }
        return purchases;
    }
    async findOne(id) {
        if (!id) {
            throw new common_1.BadRequestException('El ID es obligatorio');
        }
        const purchase = await this.prisma.purchase.findUnique({
            where: { id },
            include: {
                user: true,
                provider: true,
                details: true,
                facture: true,
            },
        });
        if (!purchase) {
            throw new common_1.NotFoundException('Compra no encontrada');
        }
        return purchase;
    }
    async update(id, updatePurchaseDto) {
        if (!id) {
            throw new common_1.BadRequestException('El ID es obligatorio');
        }
        const existingPurchase = await this.prisma.purchase.findUnique({
            where: { id },
            include: {
                user: true,
                provider: true,
                details: true,
                facture: true,
            },
        });
        if (!existingPurchase) {
            throw new common_1.NotFoundException('Compra no encontrada');
        }
        if (Object.keys(updatePurchaseDto).length === 0) {
            throw new common_1.BadRequestException('No hay datos para actualizar');
        }
        this.validateNonNegativeValues(updatePurchaseDto);
        return this.prisma.purchase.update({
            where: { id },
            data: {
                ...updatePurchaseDto,
                total: this.parseNumber(updatePurchaseDto.total),
                taxRate: this.parseNumber(updatePurchaseDto.taxRate),
                shipping: this.parseNumber(updatePurchaseDto.shipping),
                discount: this.parseNumber(updatePurchaseDto.discount),
                taxNet: this.parseNumber(updatePurchaseDto.taxNet),
                paidAmount: this.parseNumber(updatePurchaseDto.paidAmount),
                grandTotal: this.parseNumber(updatePurchaseDto.grandTotal),
                status: this.parseNumber(updatePurchaseDto.status),
                details: updatePurchaseDto.details
                    ? {
                        update: updatePurchaseDto.details.map((detail) => ({
                            where: { id: detail.id },
                            data: {
                                productId: detail.productId,
                                quantity: detail.quantity,
                                price: detail.price,
                                taxNet: detail.taxNet,
                                discount: detail.discount,
                                discountMethod: detail.discountMethod,
                                taxMethod: detail.taxMethod,
                            },
                        })),
                    }
                    : undefined,
                facture: {
                    update: updatePurchaseDto.payments?.map((payment) => ({
                        where: { id: payment.id },
                        data: {
                            amount: payment.amount,
                            charge: payment.charge,
                            ref: payment.ref,
                            reglement: payment.reglement,
                            userId: payment.userId,
                            date: payment.date,
                            notes: payment.notes,
                            accountId: payment.accountId,
                        },
                    })),
                },
            },
            include: {
                user: true,
                provider: true,
                details: true,
                facture: true,
            },
        });
    }
    async remove(id) {
        if (!id) {
            throw new common_1.BadRequestException('El ID es obligatorio');
        }
        const existingPurchase = await this.prisma.purchase.findUnique({
            where: { id },
            include: {
                user: true,
                provider: true,
                details: true,
                facture: true,
            },
        });
        if (!existingPurchase) {
            throw new common_1.NotFoundException('Compra no encontrada');
        }
        return this.prisma.purchase.delete({
            where: { id },
            include: {
                user: true,
                provider: true,
                details: true,
                facture: true,
            },
        });
    }
    validateRequiredFields(dto) {
        const requiredFields = [
            'providerId',
            'userId',
            'total',
            'taxRate',
            'shipping',
            'discount',
            'taxNet',
            'paidAmount',
            'grandTotal',
            'paymentType',
        ];
        for (const field of requiredFields) {
            if (dto[field] === undefined || dto[field] === null) {
                throw new common_1.BadRequestException(`El campo ${field} es obligatorio`);
            }
        }
    }
    validateNonNegativeValues(dto) {
        const nonNegativeFields = [
            'total',
            'taxRate',
            'shipping',
            'discount',
            'taxNet',
            'paidAmount',
            'grandTotal',
        ];
        for (const field of nonNegativeFields) {
            if (dto[field] !== undefined && dto[field] < 0) {
                throw new common_1.BadRequestException(`El campo ${field} no puede ser negativo`);
            }
        }
    }
    parseNumber(value) {
        if (value === undefined)
            return undefined;
        return typeof value === 'string' ? parseFloat(value) : value;
    }
    handlePrismaError(error) {
        const prismaError = error;
        if (prismaError.code === 'P2002') {
            const target = Array.isArray(prismaError.meta?.target)
                ? prismaError.meta.target
                : [];
            if (target.includes('User_id_key')) {
                throw new Error('El usuario de la compra ya está registrado');
            }
            if (target.includes('Provider_sku_key')) {
                throw new Error('El proveedor de la compra ya está registrado');
            }
            throw new Error(`Unique constraint failed on: ${target.join(',') || 'unknown field'}`);
        }
        throw error;
    }
};
exports.PurchasesService = PurchasesService;
exports.PurchasesService = PurchasesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PurchasesService);
//# sourceMappingURL=purchases.service.js.map