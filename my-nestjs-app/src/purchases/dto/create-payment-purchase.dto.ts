export class CreatePaymentPurchaseDto {
  readonly id?: string;
  readonly amount!: number;
  readonly charge!: number;
  readonly ref!: string;
  readonly reglement!: string;
  readonly userId!: string;
  readonly notes!: string;
  readonly accountId?: string;
}
