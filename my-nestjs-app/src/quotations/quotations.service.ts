import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateQuotationDto } from './dto/create-quotation.dto';
import { CreateQuotationDetailDto } from './dto/create-quotation-detail.dto';
import { CreatePriceRangeDto } from './dto/create-pricerange.dto';
import { UpdateQuotationDto } from './dto/update-quotation.dto';
import { Quotation } from '@prisma/client';

@Injectable()
export class QuotationsService {
  constructor(private prisma: PrismaService) {}

  async create(createQuotationDto: CreateQuotationDto): Promise<Quotation> {
    const {
      quotationNumber,
      validUntil,
      clientId,
      userId,
      employeeAssignedId,
      observations,
      internalNotes,
      paymentTerms,
      deliveryDate,
      shipping,
      taxRate,
      includesTax,
      details,
    } = createQuotationDto;

    // Validar campos requeridos
    this.validateRequiredFields(createQuotationDto);

    // Validar valores no negativos
    this.validateNonNegativeValues(createQuotationDto);

    // Verificar si la cotización ya existe (si se proporciona quotationNumber)
    if (quotationNumber) {
      const existingQuotation = await this.prisma.quotation.findFirst({
        where: {
          quotationNumber,
        },
      });
      if (existingQuotation) {
        throw new BadRequestException('La cotización ya está registrada');
      }
    }

    // Calcular totales
    const calculatedDetails = details.map((detail) =>
      this.calculateDetailTotals(detail),
    );

    // Calcular subtotal (suma de todos los totales de los detalles)
    const subtotal = calculatedDetails.reduce((sum, detail) => {
      return sum + detail.total;
    }, 0);

    // Descuento total aplicado a la cotización.
    const totalDiscount = calculatedDetails.reduce(
      (sum, detail) =>
        sum + detail.discountValue + detail.commercialDiscountValue,
      0,
    );

    // Valor neto después del descuento.
    const totalNet = subtotal - totalDiscount;

    // Calcular utilidad
    const totalProfit = calculatedDetails.reduce(
      (sum, detail) => sum + (detail.netValue * detail.profitPercentage) / 100,
      0,
    );

    // Calcular impuestos si incluye impuestos
    const taxAmount = includesTax ? (totalNet * taxRate) / 100 : 0;

    // Calcular total con impuestos y envío
    const grandTotal = subtotal + taxAmount + shipping;

    // Valor final después de aplicar impuestos.
    const totalWithTax = totalNet + taxAmount;

    try {
      // Generar número de cotización si no se proporciona
      const quotationNum =
        quotationNumber || (await this.generateQuotationNumber());

      const quotation = await this.prisma.quotation.create({
        data: {
          quotationNumber: quotationNum,
          validUntil:
            validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default 30 días
          observations: observations || '',
          internalNotes: internalNotes || '',
          paymentTerms: paymentTerms || '',
          deliveryDate: deliveryDate || '',
          shipping,
          taxRate,
          includesTax,
          subTotal: subtotal,
          taxAmount,
          totalDiscount: totalDiscount || 0,
          totalNet: totalNet || 0,
          totalWithTax: totalWithTax || 0,
          grandTotal,
          status: 1, // Estado inicial: Pendiente
          client: {
            connect: {
              id: clientId,
            },
          },
          user: {
            connect: {
              id: userId,
            },
          },
          employeeAssigned: employeeAssignedId
            ? {
                connect: {
                  id: employeeAssignedId,
                },
              }
            : undefined,
          details: {
            create: calculatedDetails.map((detail) => ({
              product: { connect: { id: detail.productId } },
              brand: detail.brandId
                ? { connect: { id: detail.brandId } }
                : undefined,
              description: detail.description,
              quantity: detail.quantity,
              unitPrice: detail.unitPrice,
              discount: detail.discount,
              discountType: detail.discountType,
              commercialDiscount: detail.commercialDiscount,
              commercialDiscType: detail.commercialDiscType,
              brandCost: detail.brandCost,
              adminExpenses: detail.adminExpenses,
              profitPercentage: detail.profitPercentage,
              subtotal: detail.subtotal,
              discountValue: detail.discountValue,
              netValue: detail.netValue,
              totalWithBrand: detail.totalWithBrand,
              profit: detail.profit,
              subTotal: detail.subTotal,
              finalUnitPrice: detail.finalUnitPrice,
              netTotal: detail.totalNet,
              finalTotal: detail.total,
              taxAmount: detail.taxAmount,
              priceRanges: detail.priceRanges
                ? {
                    create: detail.priceRanges.map(
                      (range: CreatePriceRangeDto) => ({
                        minQuantity: range.minQuantity,
                        maxQuantity: range.maxQuantity,
                        unitPrice: range.unitPrice,
                        createdAt: range.createdAt,
                        updatedAt: range.updatedAt,
                      }),
                    ),
                  }
                : undefined,
            })),
          },
          statusHistory: {
            create: {
              status: 1, // Estado inicial: Pendiente
              user: {
                connect: {
                  id: userId,
                },
              },
              comment: 'Cotización creada',
              createdAt: new Date(),
            },
          },
        },
        include: {
          user: true,
          client: true,
          employeeAssigned: true,
          details: {
            include: {
              product: true,
              brand: true,
              priceRanges: true,
            },
          },
          statusHistory: true,
        },
      });

      return quotation;
    } catch (error) {
      console.error('Error al crear la cotización:', error);
      throw new BadRequestException(error.message);
    }
  }

  async findAll(): Promise<Quotation[]> {
    const quotations = await this.prisma.quotation.findMany({
      include: {
        user: true,
        client: true,
        employeeAssigned: true,
        details: {
          include: {
            product: true,
            brand: true,
            priceRanges: true,
          },
        },
        statusHistory: true,
      },
    });
    if (quotations.length === 0) {
      throw new NotFoundException('No se encontraron cotizaciones');
    }
    return quotations;
  }

  async findOne(id: string): Promise<Quotation | null> {
    if (!id) {
      throw new BadRequestException('El ID es obligatorio');
    }

    const quotation = await this.prisma.quotation.findUnique({
      where: { id },
      include: {
        user: true,
        client: true,
        employeeAssigned: true,
        details: {
          include: {
            product: true,
            brand: true,
            priceRanges: true,
          },
        },
        statusHistory: true,
      },
    });

    if (!quotation) {
      throw new NotFoundException('Cotización no encontrada');
    }

    return quotation;
  }

  async update(
    id: string,
    updateQuotationDto: UpdateQuotationDto,
  ): Promise<Quotation> {
    if (!id) {
      throw new BadRequestException('El ID es obligatorio');
    }

    const existingQuotation = await this.prisma.quotation.findUnique({
      where: { id },
      include: {
        user: true,
        client: true,
        employeeAssigned: true,
        details: {
          include: {
            product: true,
            brand: true,
            priceRanges: true,
          },
        },
        statusHistory: true,
      },
    });

    if (!existingQuotation) {
      throw new NotFoundException('Cotización no encontrada');
    }

    if (Object.keys(updateQuotationDto).length === 0) {
      throw new BadRequestException('No hay datos para actualizar');
    }

    // Usar transacción para todas las operaciones
    return this.prisma.$transaction(async (prismaClient) => {
      // 1. Si hay cambio de estado, agregar a historial
      if (
        updateQuotationDto.status &&
        updateQuotationDto.status !== existingQuotation.status
      ) {
        await prismaClient.quotationStatusHistory.create({
          data: {
            quotation: { connect: { id } },
            status: updateQuotationDto.status,
            user: {
              connect: {
                id: updateQuotationDto.userId || existingQuotation.userId,
              },
            },
            comment:
              updateQuotationDto.statusComment ||
              `Estado actualizado a ${updateQuotationDto.status}`,
            createdAt: new Date(),
          },
        });
      }

      // 2. Si hay detalles, actualizar cada uno
      if (
        updateQuotationDto.details &&
        Array.isArray(updateQuotationDto.details)
      ) {
        for (const detail of updateQuotationDto.details) {
          // Calcular totales del detalle
          const calculatedDetail = this.calculateDetailTotals(detail);

          if (detail.id) {
            // Actualizar detalle existente
            await prismaClient.quotationDetail.update({
              where: { id: detail.id },
              data: {
                ...Object.fromEntries(
                  Object.entries(detail).filter(
                    ([_, value]) => value !== undefined,
                  ),
                ),
              },
            });

            // Actualizar rangos de precios si existen
            if (detail.priceRanges && Array.isArray(detail.priceRanges)) {
              // Eliminar rangos existentes
              await prismaClient.productPriceRange.deleteMany({
                where: { quotationDetailId: detail.id },
              });

              // Crear nuevos rangos
              for (const range of detail.priceRanges) {
                await prismaClient.productPriceRange.create({
                  data: {
                    quotationDetail: { connect: { id: detail.id } },
                    minQuantity: range.minQuantity,
                    maxQuantity: range.maxQuantity,
                    unitPrice: range.unitPrice,
                    createdAt: range.createdAt || new Date(),
                    updatedAt: range.updatedAt || new Date(),
                  },
                });
              }
            }
          } else {
            // Crear nuevo detalle
            await prismaClient.quotationDetail.create({
              data: {
                quotation: { connect: { id } },
                product: { connect: { id: calculatedDetail.productId } },
                ...(calculatedDetail.brandId && {
                  brand: { connect: { id: calculatedDetail.brandId } },
                }),
                description: calculatedDetail.description,
                quantity: calculatedDetail.quantity,
                unitPrice: calculatedDetail.unitPrice,
                discount: calculatedDetail.discount,
                discountType: calculatedDetail.discountType,
                commercialDiscount: calculatedDetail.commercialDiscount,
                commercialDiscType: calculatedDetail.commercialDiscType,
                brandCost: calculatedDetail.brandCost,
                adminExpenses: calculatedDetail.adminExpenses,
                profitPercentage: calculatedDetail.profitPercentage,
                subtotal: calculatedDetail.subtotal,
                discountValue: calculatedDetail.discountValue,
                netValue: calculatedDetail.netValue,
                commercialDiscountValue:
                  calculatedDetail.commercialDiscountValue,
                totalNet: calculatedDetail.totalNet,
                totalWithBrand: calculatedDetail.totalWithBrand,
                profit: calculatedDetail.profit,
                total: calculatedDetail.total,
                finalUnitPrice: calculatedDetail.finalUnitPrice,
                priceRanges: detail.priceRanges
                  ? {
                      create: detail.priceRanges.map((range) => ({
                        minQuantity: range.minQuantity,
                        maxQuantity: range.maxQuantity,
                        unitPrice: range.unitPrice,
                        createdAt: range.createdAt || new Date(),
                        updatedAt: range.updatedAt || new Date(),
                      })),
                    }
                  : undefined,
              },
            });
          }
        }
      }

      // 3. Recalcular totales de la cotización completa
      const updatedDetails = await prismaClient.quotationDetail.findMany({
        where: { quotationId: id },
      });

      const subTotal = updatedDetails.reduce(
        (sum, detail) => sum + detail.finalTotal,
        0,
      );
      const taxRate =
        updateQuotationDto.taxRate !== undefined
          ? updateQuotationDto.taxRate
          : existingQuotation.taxRate;
      const includesTax =
        updateQuotationDto.includesTax !== undefined
          ? updateQuotationDto.includesTax
          : existingQuotation.includesTax;
      const shipping =
        updateQuotationDto.shipping !== undefined
          ? updateQuotationDto.shipping
          : existingQuotation.shipping;

      const taxAmount = includesTax ? (subTotal * taxRate) / 100 : 0;
      const grandTotal = subTotal + taxAmount + shipping;

      // 4. Actualizar la cotización principal
      const { details, statusComment, ...quotationData } = updateQuotationDto;

      const updatedQuotation = await prismaClient.quotation.update({
        where: { id },
        data: {
          ...quotationData,
          subTotal,
          taxAmount,
          grandTotal,
        },
        include: {
          user: true,
          client: true,
          employeeAssigned: true,
          details: {
            include: {
              product: true,
              brand: true,
              priceRanges: true,
            },
          },
          statusHistory: true,
        },
      });

      return updatedQuotation;
    });
  }

  async remove(id: string): Promise<Quotation> {
    if (!id) {
      throw new BadRequestException('El ID es obligatorio');
    }

    const existingQuotation = await this.prisma.quotation.findUnique({
      where: { id },
      include: {
        details: true,
        orders: true,
        statusHistory: true,
        comments: true,
      },
    });

    if (!existingQuotation) {
      throw new NotFoundException('Cotización no encontrada');
    }

    await this.prisma.$transaction(async (prisma) => {
      // 1. Eliminar detalles de cotización
      await prisma.quotationDetail.deleteMany({
        where: { quotationId: id },
      });

      // 2. Eliminar pedidos asociados
      await prisma.order.deleteMany({
        where: { quotationId: id },
      });

      // 3. Eliminar historial de estado
      await prisma.quotationStatusHistory.deleteMany({
        where: { quotationId: id },
      });

      // 4. Eliminar comentarios de la cotización
      await prisma.quotationComment.deleteMany({
        where: { quotationId: id },
      });

      // 5. Finalmente, eliminar la cotización
      await prisma.quotation.delete({
        where: { id },
      });
    });

    return existingQuotation;
  }

  async updateStatus(
    id: string,
    status: number,
    userId: string,
    comment?: string,
  ): Promise<Quotation> {
    if (!id) {
      throw new BadRequestException('El ID es obligatorio');
    }

    const existingQuotation = await this.prisma.quotation.findUnique({
      where: { id },
    });

    if (!existingQuotation) {
      throw new NotFoundException('Cotización no encontrada');
    }

    return this.prisma.$transaction(async (prismaClient) => {
      // Crear registro en historial
      await prismaClient.quotationStatusHistory.create({
        data: {
          quotation: { connect: { id } },
          status,
          user: { connect: { id: userId } },
          comment: comment || `Estado actualizado a ${status}`,
          createdAt: new Date(),
        },
      });

      // Actualizar estado de la cotización
      const updatedQuotation = await prismaClient.quotation.update({
        where: { id },
        data: { status },
        include: {
          user: true,
          client: true,
          employeeAssigned: true,
          details: {
            include: {
              product: true,
              brand: true,
              priceRanges: true,
            },
          },
          statusHistory: true,
        },
      });

      return updatedQuotation;
    });
  }

  private calculateDetailTotals(detail: CreateQuotationDetailDto): any {
    // Calcular subtotal (cantidad * precio unitario)
    const subtotal = detail.quantity * detail.unitPrice;

    // Calcular valor del descuento
    let discountValue = 0;
    if (detail.discount > 0) {
      // Tipo de descuento: 1 = Porcentaje, 2 = Monto fijo
      discountValue =
        detail.discountType === 1
          ? (subtotal * detail.discount) / 100
          : detail.discount;
    }

    // Calcular valor neto (subtotal - descuento)
    const netValue = subtotal - discountValue;

    // Calcular valor del descuento comercial
    let commercialDiscountValue = 0;
    if (detail.commercialDiscount > 0) {
      // Tipo de descuento comercial: 1 = Porcentaje, 2 = Monto fijo
      commercialDiscountValue =
        detail.commercialDiscType === 1
          ? (netValue * detail.commercialDiscount) / 100
          : detail.commercialDiscount;
    }

    // Calcular total neto (valor neto - descuento comercial)
    const totalNet = netValue - commercialDiscountValue;

    // Calcular total con marca (total neto + costo de marca + gastos administrativos)
    const totalWithBrand = totalNet + detail.brandCost + detail.adminExpenses;

    // Calcular utilidad
    const profit = (totalWithBrand * detail.profitPercentage) / 100;

    // Calcular total final (total con marca + utilidad)
    const total = totalWithBrand + profit;

    // Calcular precio unitario final (total / cantidad)
    const finalUnitPrice = total / detail.quantity;

    return {
      ...detail,
      subtotal,
      discountValue,
      netValue,
      commercialDiscountValue,
      totalNet,
      totalWithBrand,
      profit,
      total,
      finalUnitPrice,
    };
  }

  private async generateQuotationNumber(): Promise<string> {
    const date = new Date();
    const year = date.getFullYear().toString().substring(2); // Últimos 2 dígitos del año
    const month = (date.getMonth() + 1).toString().padStart(2, '0');

    // Obtener el último número de cotización para este mes
    const lastQuotation = await this.prisma.quotation.findFirst({
      where: {
        quotationNumber: {
          startsWith: `COT-${year}${month}`,
        },
      },
      orderBy: {
        quotationNumber: 'desc',
      },
    });

    let sequence = 1;
    if (lastQuotation) {
      const lastSequence = parseInt(
        lastQuotation.quotationNumber.split('-')[2],
      );
      sequence = lastSequence + 1;
    }

    return `COT-${year}${month}-${sequence.toString().padStart(4, '0')}`;
  }

  private validateRequiredFields(
    dto: CreateQuotationDto | UpdateQuotationDto,
  ): void {
    const requiredFields = ['clientId', 'userId', 'date', 'taxRate', 'details'];

    for (const field of requiredFields) {
      if (dto[field] === undefined || dto[field] === null) {
        throw new BadRequestException(`El campo ${field} es obligatorio`);
      }
    }

    // Validar que hay al menos un detalle
    if (
      !dto.details ||
      !Array.isArray(dto.details) ||
      dto.details.length === 0
    ) {
      throw new BadRequestException(
        'Debe incluir al menos un detalle en la cotización',
      );
    }
  }

  private validateNonNegativeValues(
    dto: Partial<CreateQuotationDto | UpdateQuotationDto>,
  ): void {
    const nonNegativeFields = ['shipping', 'taxRate'];

    for (const field of nonNegativeFields) {
      if (dto[field] !== undefined && dto[field] < 0) {
        throw new BadRequestException(
          `El campo ${field} no puede ser negativo`,
        );
      }
    }

    // Validar valores no negativos en detalles
    if (dto.details && Array.isArray(dto.details)) {
      for (const detail of dto.details) {
        if (detail.quantity <= 0) {
          throw new BadRequestException('La cantidad debe ser mayor que cero');
        }
        if (detail.unitPrice < 0) {
          throw new BadRequestException(
            'El precio unitario no puede ser negativo',
          );
        }
      }
    }
  }
}
