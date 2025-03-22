export class CreateProductDto {
  readonly name!: string;
  readonly code?: string;
  readonly typeBarcode?: string;
  readonly cost!: number;
  readonly price!: number;
  readonly brandId?: string;
  readonly taxMethod!: string;
  readonly image!: string;
  readonly note!: string;
  readonly type!: string;
  readonly stock!: number;
  readonly categoryId!: string;
  readonly sku!: string;
  readonly status!: number;
}
