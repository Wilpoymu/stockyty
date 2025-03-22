export class CreatePurchaseDetailDto {
  readonly id?: string;
  readonly productId!: string;
  readonly quantity!: number;
  readonly price!: number;
  readonly taxNet: number;
  readonly discount!: number;
  readonly discountMethod!: string;
  readonly taxMethod!: string;
  readonly total: number;
  readonly productVariantId!: string;
}
