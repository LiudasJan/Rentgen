// Constants for random data generation
const RANDOM_STRING_LENGTH = 32;
const MAX_RANDOM_INTEGER = 10_000_000;
const MIN_RANDOM_INTEGER = 1;
const RANDOM_EMAIL_USERNAME_LENGTH = 8;
const TEST_EMAIL_DOMAIN = 'qaontime.com';

/**
 * Generates a random alphanumeric string of specified length
 * @param length - Optional length override, defaults to RANDOM_STRING_LENGTH
 * @returns Random string for testing purposes
 */
export function generateRandomString(length: number = RANDOM_STRING_LENGTH): string {
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let randomString = '';
  for (let i = 0; i < length; i++) randomString += characters[Math.floor(Math.random() * characters.length)];

  return randomString;
}

/**
 * Generates a random integer within the specified range
 * @param min - Minimum value (inclusive), defaults to MIN_RANDOM_INTEGER
 * @param max - Maximum value (inclusive), defaults to MAX_RANDOM_INTEGER
 * @returns Random integer for testing purposes
 */
export function generateRandomInteger(min: number = MIN_RANDOM_INTEGER, max: number = MAX_RANDOM_INTEGER): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generates a random email address for testing
 * @param domain - Optional domain override, defaults to TEST_EMAIL_DOMAIN
 * @param usernameLength - Optional username length override, defaults to RANDOM_EMAIL_USERNAME_LENGTH
 * @returns Random email address with specified or default domain
 */
export function generateRandomEmail(
  domain: string = TEST_EMAIL_DOMAIN,
  usernameLength: number = RANDOM_EMAIL_USERNAME_LENGTH,
): string {
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let username = '';
  for (let i = 0; i < usernameLength; i++) username += characters[Math.floor(Math.random() * characters.length)];

  return `${username}@${domain}`;
}
