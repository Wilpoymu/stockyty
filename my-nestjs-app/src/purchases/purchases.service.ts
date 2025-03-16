import {
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreatePurchaseDto,
  CreatePurchaseDetailDto,
  CreatePaymentPurchaseDto,
} from './dto/create-purchase.dto';
import { UpdatePurchaseDto } from './dto/update-purchase.dto';
import { Purchase } from '@prisma/client';

interface PrismaError {
  code?: string;
  meta?: {
    target?: string[];
    [key: string]: any;
  };
}

@Injectable()
export class PurchasesService {
  constructor(private prisma: PrismaService) {}

  async create(createPurchaseDto: CreatePurchaseDto): Promise<Purchase> {
    const {
      id,
      date,
      ref,
      providerId,
      total,
      taxRate,
      shipping,
      discount,
      notes,
      taxNet,
      paidAmount,
      paymentStatus,
      status,
      grandTotal,
      paymentType,
      createdAt,
      updatedAt,
      deletedAt,
      userId,
      details,
      payments,
    } = createPurchaseDto;

    // Validar campos requeridos
    this.validateRequiredFields(createPurchaseDto);

    // Validar valores no negativos
    this.validateNonNegativeValues(createPurchaseDto);

    // Verificar si la compra ya existe
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
            create: details.map((detail: CreatePurchaseDetailDto) => ({
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
            create: payments?.map((payment: CreatePaymentPurchaseDto) => ({
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
    } catch (error: any) {
      console.error('Error al crear la compra:', error);
      throw new InternalServerErrorException(error.message);
    }
  }

  async findAll(): Promise<Purchase[]> {
    const purchases = await this.prisma.purchase.findMany({
      include: {
        user: true,
        provider: true,
        details: true,
        facture: true,
      },
    });
    if (purchases.length === 0) {
      throw new NotFoundException('No se encontraron compras');
    }
    return purchases;
  }

  async findOne(id: string): Promise<Purchase | null> {
    if (!id) {
      throw new BadRequestException('El ID es obligatorio');
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
      throw new NotFoundException('Compra no encontrada');
    }

    return purchase;
  }

  async update(
    id: string,
    updatePurchaseDto: UpdatePurchaseDto,
  ): Promise<Purchase> {
    if (!id) {
      throw new BadRequestException('El ID es obligatorio');
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
      throw new NotFoundException('Compra no encontrada');
    }

    if (Object.keys(updatePurchaseDto).length === 0) {
      throw new BadRequestException('No hay datos para actualizar');
    }

    // Validar valores no negativos
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

  async remove(id: string): Promise<Purchase> {
    if (!id) {
      throw new BadRequestException('El ID es obligatorio');
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
      throw new NotFoundException('Compra no encontrada');
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

  private validateRequiredFields(
    dto: CreatePurchaseDto | UpdatePurchaseDto,
  ): void {
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
        throw new BadRequestException(`El campo ${field} es obligatorio`);
      }
    }
  }

  private validateNonNegativeValues(
    dto: Partial<CreatePurchaseDto | UpdatePurchaseDto>,
  ): void {
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
        throw new BadRequestException(
          `El campo ${field} no puede ser negativo`,
        );
      }
    }
  }

  private parseNumber(value: string | number | undefined): number | undefined {
    if (value === undefined) return undefined;
    return typeof value === 'string' ? parseFloat(value) : value;
  }

  private handlePrismaError(error: unknown): never {
    const prismaError = error as PrismaError;
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
      throw new Error(
        `Unique constraint failed on: ${target.join(',') || 'unknown field'}`,
      );
    }
    throw error;
  }
}
