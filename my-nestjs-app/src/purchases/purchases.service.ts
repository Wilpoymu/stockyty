import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { CreatePurchaseDetailDto } from './dto/create-purchase-detail.dto';
import { CreatePaymentPurchaseDto } from './dto/create-payment-purchase.dto';
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

    const totalCalculated = details.reduce((sum, detail) => {
      return (
        sum +
        detail.quantity * detail.price +
        (detail.taxNet ?? 0) -
        (detail.discount ?? 0)
      );
    }, 0);

    const taxNetValue = taxNet ?? (total * taxRate) / 100;
    const grandTotalValue = totalCalculated + taxNetValue + shipping - discount;

    try {
      const purchase = await this.prisma.purchase.create({
        data: {
          ref,
          total: totalCalculated,
          taxRate,
          shipping,
          discount,
          notes: notes ?? '',
          taxNet: taxNetValue,
          paidAmount,
          paymentStatus: paymentStatus ?? 'PENDING',
          status: status ?? 1,
          grandTotal: grandTotalValue,
          paymentType,
          createdAt,
          updatedAt,
          deletedAt,
          provider: {
            connect: {
              id: providerId,
            },
          },
          user: {
            connect: {
              id: userId,
            },
          },
          details: {
            create: details.map((detail: CreatePurchaseDetailDto) => ({
              product: { connect: { id: detail.productId } },
              quantity: detail.quantity,
              price: detail.price,
              taxNet: detail.taxNet,
              discount: detail.discount,
              discountMethod: detail.discountMethod,
              taxMethod: detail.taxMethod,
              total:
                detail.quantity * detail.price +
                detail.taxNet -
                detail.discount,
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

      await this.prisma.$transaction(
        details.map((detail) =>
          this.prisma.product.update({
            where: { id: detail.productId },
            data: { stock: { increment: detail.quantity } },
          }),
        ),
      );

      return purchase;
    } catch (error) {
      console.error('Error al crear la compra:', error);
      throw new BadRequestException(error.message);
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

    // Usar transacción para todas las operaciones
    return this.prisma.$transaction(async (prismaClient) => {
      // 1. Si hay detalles, actualizar productos primero
      if (
        updatePurchaseDto.details &&
        Array.isArray(updatePurchaseDto.details) &&
        updatePurchaseDto.details.length > 0
      ) {
        for (const detail of updatePurchaseDto.details) {
          const existingDetail = await prismaClient.purchaseDetail.findUnique({
            where: { id: detail.id },
          });

          if (!existingDetail) {
            throw new NotFoundException(
              `Detalle de compra no encontrado con ID: ${detail.id}`,
            );
          }

          const quantityDifference = detail.quantity - existingDetail.quantity;

          await prismaClient.product.update({
            where: { id: detail.productId },
            data: { stock: { increment: quantityDifference } },
          });

          // 2. Actualizar cada detalle individualmente
          await prismaClient.purchaseDetail.update({
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
          });
        }
      }

      // 3. Actualizar pagos si existen
      if (
        updatePurchaseDto.payments &&
        Array.isArray(updatePurchaseDto.payments)
      ) {
        for (const payment of updatePurchaseDto.payments) {
          await prismaClient.paymentPurchase.update({
            where: { id: payment.id },
            data: {
              amount: payment.amount,
              charge: payment.charge,
              ref: payment.ref,
              reglement: payment.reglement,
              userId: payment.userId,
              notes: payment.notes,
              accountId: payment.accountId,
            },
          });
        }
      }

      // 4. Actualizar la compra principal (sin los campos anidados)
      const { details, payments, ...purchaseData } = updatePurchaseDto;

      const updatedPurchase = await prismaClient.purchase.update({
        where: { id },
        data: {
          ...purchaseData,
          total: this.parseNumber(updatePurchaseDto.total),
          taxRate: this.parseNumber(updatePurchaseDto.taxRate),
          shipping: this.parseNumber(updatePurchaseDto.shipping),
          discount: this.parseNumber(updatePurchaseDto.discount),
          taxNet: this.parseNumber(updatePurchaseDto.taxNet),
          paidAmount: this.parseNumber(updatePurchaseDto.paidAmount),
          grandTotal: this.parseNumber(updatePurchaseDto.grandTotal),
          status: this.parseNumber(updatePurchaseDto.status),
        },
        include: {
          user: true,
          provider: true,
          details: true,
          facture: true,
        },
      });

      return updatedPurchase;
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
      'taxRate',
      'shipping',
      'discount',
      'paidAmount',
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

  // Esta función no se está utilizando, pero la quiero dejar porque sé que en algún momento voy a necesitar utilizarla *o*
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
