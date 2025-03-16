/**
 * @class CreateRoleDto
 * @description Data Transfer Object for creating a role.
 */
export class CreateRoleDto {
  /**
   * The unique name of the role.
   * @type {string}
   */
  readonly name!: string;

  /**
   * A human-readable label for the role.
   * @type {string | undefined}
   */
  readonly label?: string;

  /**
   * A description of the role.
   * @type {string | undefined}
   */
  readonly description?: string;

  /**
   * The status of the role.
   * @type {number | undefined}
   */
  readonly status?: number;
}
