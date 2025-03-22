export class QuotationStatusHistoryDto {
  readonly id: string;
  readonly quotationId: string;
  readonly status: number;
  readonly type: string;
  readonly userId: string;
  readonly comment?: string;
  readonly createdAt: Date;
}
