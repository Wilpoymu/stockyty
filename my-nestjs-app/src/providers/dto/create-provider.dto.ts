export class CreateProviderDto {
  readonly name!: string;
  readonly code!: number;
  readonly email!: string;
  readonly phone!: string;
  readonly country?: string;
  readonly city?: string;
  readonly address!: string;
  readonly contactName!: string;
  readonly status!: number;
  readonly taxNumber?: string;
}
