/**
 * @class CreateUserDto
 * @description Data Transfer Object for creating a user.
 */
export class CreateUserDto {
  /**
   * The first name of the user.
   * @type {string}
   */
  readonly firstname!: string;

  /**
   * The last name of the user.
   * @type {string}
   */
  readonly lastname!: string;

  /**
   * The username for the user.
   * @type {string}
   */
  readonly username!: string;

  /**
   * The email address of the user.
   * @type {string}
   */
  readonly email!: string;

  /**
   * The password for the user.
   * @type {string}
   */
  readonly password!: string;

  /**
   * The phone number of the user.
   * @type {string}
   */
  readonly phone!: string;

  /**
   * The document number (e.g., ID) of the user.
   * @type {string}
   */
  readonly documentNumber!: string; // Renombrado de "document"

  /**
   * The address of the user.
   * @type {string}
   */
  readonly address!: string;

  /**
   * The status of the user.
   * @type {number}
   */
  readonly status!: number; // renamed from "statut"

  /**
   * The avatar URL or filename of the user.
   * @type {string | undefined}
   */
  readonly avatar?: string;

  /**
   * The role identifier for the user.
   * @type {string}
   */
  readonly role_id!: string;
}
