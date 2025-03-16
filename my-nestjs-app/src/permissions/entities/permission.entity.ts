interface Role {
  id: string;
  name: string;
}

export class Permission {
  id!: string;
  name!: string;
  label?: string;
  description?: string;
  createdAt!: Date;
  updatedAt!: Date;

  roles?: Role[];

  inRole(role: string | Role[]): boolean {
    if (typeof role === 'string') {
      return this.roles?.some((r) => r.name === role) || false;
    }
    return (
      role?.some((r) => this.roles?.some((myRole) => myRole.id === r.id)) ||
      false
    );
  }
}
