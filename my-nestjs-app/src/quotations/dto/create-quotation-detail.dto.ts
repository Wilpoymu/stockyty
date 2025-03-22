import { CreatePriceRangeDto } from './create-pricerange.dto';

export class CreateQuotationDetailDto {
  readonly id: string;
  readonly productId: string;
  readonly brandId?: string;
  readonly description: string;
  readonly quantity: number;
  readonly unitPrice: number;
  readonly subtotal: number;

  // Descuentos
  readonly discount: number = 0;
  readonly discountType: number;
  readonly commercialDiscount: number = 0;
  readonly commercialDiscType: number;
  readonly discountValue: number;
  readonly taxAmount: number;

  // Marca y gastos
  readonly brandCost: number = 0;
  readonly adminExpenses: number = 0;

  // Utilidad
  readonly profitPercentage: number = 20;

  // Rangos de precios opcionales
  readonly priceRanges?: CreatePriceRangeDto[];
}
