export class CreateSaleDetailDto {
  date: Date;
  saleId: string;
  saleUnitId?: string;
  quantity: number;
  productId: string;
  total: number;
  productVariantId?: string;
  price: number;
  TaxNet: number;
  discount: number;
  discountMethod: string;
  taxMethod: string;
}
