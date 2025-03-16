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
exports.CategoriesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let CategoriesService = class CategoriesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createCategoryDto) {
        const { name, code, description, type } = createCategoryDto;
        if (!name || !description || !type) {
            throw new common_1.BadRequestException('Todos los campos son obligatorios');
        }
        const existingCategory = await this.prisma.category.findFirst({
            where: {
                OR: [{ name }, { code }],
            },
        });
        if (existingCategory) {
            throw new common_1.BadRequestException('La categoria ya se encuentra registrada');
        }
        try {
            const category = await this.prisma.category.create({
                data: { name, code, description, type },
            });
            return category;
        }
        catch (error) {
            const prismaError = error;
            if (prismaError.code === 'P2002') {
                const target = Array.isArray(prismaError.meta?.target)
                    ? prismaError.meta.target
                    : [];
                if (target.includes('Category_name_key')) {
                    throw new common_1.BadRequestException('El nombre de la categoria ya esta registrado');
                }
                throw new common_1.BadRequestException(`Unique constraint failed on: ${target.join(',') || 'unknown field'}`);
            }
            throw error;
        }
    }
    async findAll() {
        const categories = await this.prisma.category.findMany();
        if (categories.length === 0) {
            throw new common_1.NotFoundException('No se encontraron categorías');
        }
        return categories;
    }
    async findOne(id) {
        if (!id) {
            throw new common_1.BadRequestException('El ID es obligatorio');
        }
        const category = await this.prisma.category.findUnique({
            where: { id },
        });
        if (!category) {
            throw new common_1.NotFoundException('Categoría no encontrada');
        }
        return category;
    }
    async update(id, updateCategoryDto) {
        if (!id) {
            throw new common_1.BadRequestException('El ID es obligatorio');
        }
        const existingCategory = await this.prisma.category.findUnique({
            where: { id },
        });
        if (!existingCategory) {
            throw new common_1.NotFoundException('Categoría no encontrada');
        }
        if (Object.keys(updateCategoryDto).length === 0) {
            throw new common_1.BadRequestException('No hay datos para actualizar');
        }
        return this.prisma.category.update({
            where: { id },
            data: updateCategoryDto,
        });
    }
    async remove(id) {
        if (!id) {
            throw new common_1.BadRequestException('El ID es obligatorio');
        }
        const existingCategory = await this.prisma.category.findUnique({
            where: { id },
        });
        if (!existingCategory) {
            throw new common_1.NotFoundException('Categoría no encontrada');
        }
        return this.prisma.category.delete({
            where: { id },
        });
    }
};
exports.CategoriesService = CategoriesService;
exports.CategoriesService = CategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CategoriesService);
//# sourceMappingURL=categories.service.js.map