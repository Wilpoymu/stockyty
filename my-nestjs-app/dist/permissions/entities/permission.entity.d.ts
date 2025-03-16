interface Role {
    id: string;
    name: string;
}
export declare class Permission {
    id: string;
    name: string;
    label?: string;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
    roles?: Role[];
    inRole(role: string | Role[]): boolean;
}
export {};
