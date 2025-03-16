import * as bcrypt from 'bcrypt';

/**
 * Hashes a password using bcrypt.
 *
 * @async
 * @function hashPassword
 * @param {string} password - The plain text password to be hashed.
 * @param {number} [saltRounds=10] - The number of salt rounds to use (default is 10).
 * @returns {Promise<string>} A promise that resolves with the hashed password.
 */
export async function hashPassword(
  password: string,
  saltRounds: number = 10,
): Promise<string> {
  return bcrypt.hash(password, saltRounds);
}

/**
 * Compares a plain text password with a hash to verify if they match.
 *
 * @async
 * @function comparePassword
 * @param {string} password - The plain text password to verify.
 * @param {string} hash - The hashed password to compare against.
 * @returns {Promise<boolean>} A promise that resolves with a boolean indicating if the passwords match.
 */
export async function comparePassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
