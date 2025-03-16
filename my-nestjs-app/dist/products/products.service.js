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
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ProductsService = class ProductsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createProductDto) {
        const { name, code, typeBarcode, cost, price, unitId, unitPurchaseId, unitSaleId, stockAlert, subCategoryId, brandId, isActive, isImei, isVariant, taxMethod, image, note, type, stock, status, sku, categoryId, } = createProductDto;
        if (!name ||
            !cost ||
            !typeBarcode ||
            price === undefined ||
            !status ||
            !note ||
            stock === undefined ||
            !type ||
            !categoryId ||
            !sku) {
            throw new common_1.BadRequestException('Todos los campos obligatorios deben ser proporcionados');
        }
        if (price < 0) {
            throw new common_1.BadRequestException('El precio no puede ser negativo');
        }
        if (stock < 0) {
            throw new common_1.BadRequestException('El stock no puede ser negativo');
        }
        if (name.trim() === '' || sku.trim() === '') {
            throw new common_1.BadRequestException('El nombre y el SKU no pueden estar vacíos');
        }
        const existingProduct = await this.prisma.product.findFirst({
            where: {
                OR: [{ name }, { sku }],
            },
        });
        if (existingProduct) {
            throw new common_1.BadRequestException('El producto ya se encuentra registrado');
        }
        const validatedStock = stock < 1 ? 1 : stock;
        try {
            const product = await this.prisma.product.create({
                data: {
                    name,
                    code: code ?? null,
                    typeBarcode,
                    cost,
                    price,
                    unitId: unitId ?? undefined,
                    unitPurchaseId: unitPurchaseId ?? undefined,
                    unitSaleId: unitSaleId ?? undefined,
                    stockAlert,
                    subCategoryId: subCategoryId ?? undefined,
                    brandId: brandId ?? undefined,
                    isActive,
                    isImei,
                    isVariant,
                    taxMethod,
                    image,
                    note,
                    type,
                    stock: validatedStock,
                    status,
                    sku,
                    categoryId,
                },
            });
            return product;
        }
        catch (error) {
            const prismaError = error;
            if (prismaError.code == 'P2002') {
                const target = Array.isArray(prismaError.meta?.target)
                    ? prismaError.meta.target
                    : [];
                if (target.includes('Product_name_key')) {
                    throw new common_1.BadRequestException('El nombre del producto ya está registrado');
                }
                if (target.includes('Product_sku_key')) {
                    throw new common_1.BadRequestException('El código del producto ya está registrado');
                }
                throw new common_1.BadRequestException(`Unique constraint failed on: ${target.join(',') || 'unknown field'}`);
            }
            throw error;
        }
    }
    findAll() {
        return this.prisma.product.findMany({
            include: {
                category: true,
            },
        });
    }
    findOne(id) {
        return this.prisma.product.findUnique({
            where: { id },
            include: {
                category: true,
            },
        });
    }
    async update(id, updateProductDto) {
        if (updateProductDto.price !== undefined && updateProductDto.price < 0) {
            throw new common_1.BadRequestException('El precio no puede ser negativo');
        }
        if (updateProductDto.stock !== undefined && updateProductDto.stock < 0) {
            throw new common_1.BadRequestException('El stock no puede ser negativo');
        }
        const validatedStock = updateProductDto.stock !== undefined && updateProductDto.stock < 1
            ? 1
            : updateProductDto.stock;
        return this.prisma.product.update({
            where: { id },
            data: {
                ...updateProductDto,
                stock: validatedStock,
            },
        });
    }
    remove(id) {
        return this.prisma.product.delete({
            where: { id },
        });
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProductsService);
//# sourceMappingURL=products.service.js.map