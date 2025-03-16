export declare class CreatePurchaseDetailDto {
    readonly id?: string;
    readonly productId: string;
    readonly quantity: number;
    readonly price: number;
    readonly taxNet: number;
    readonly discount: number;
    readonly discountMethod: string;
    readonly taxMethod: string;
    readonly purchaseUnitId: string;
    readonly total: number;
    readonly productVariantId: string;
}
export declare class CreatePaymentPurchaseDto {
    readonly id?: string;
    readonly amount: number;
    readonly charge: number;
    readonly ref: string;
    readonly reglement: string;
    readonly userId: string;
    readonly date: Date;
    readonly notes: string;
    readonly accountId?: string;
}
export declare class CreatePurchaseDto {
    readonly id: string;
    readonly date?: Date;
    readonly ref?: string;
    readonly providerId: string;
    readonly total: number;
    readonly taxRate: number;
    readonly shipping: number;
    readonly discount: number;
    readonly notes?: string;
    readonly taxNet: number;
    readonly paidAmount: number;
    readonly paymentStatus?: string;
    readonly status?: number;
    readonly grandTotal: number;
    readonly paymentType: string;
    readonly createdAt?: Date;
    readonly updatedAt?: Date;
    readonly deletedAt?: Date;
    readonly userId: string;
    readonly details: CreatePurchaseDetailDto[];
    readonly payments?: CreatePaymentPurchaseDto[];
}
