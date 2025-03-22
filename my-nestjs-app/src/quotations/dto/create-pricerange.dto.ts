export class CreatePriceRangeDto {
  readonly minQuantity: number;
  readonly maxQuantity?: number;
  readonly unitPrice: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
