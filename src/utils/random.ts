import { DataType } from '../types';

const RANDOM_STRING_LENGTH = 32;
const MAX_RANDOM_INTEGER = 10_000_000;
const MIN_RANDOM_INTEGER = 1;
const RANDOM_EMAIL_USERNAME_LENGTH = 8;
const TEST_EMAIL_DOMAIN = 'qaontime.com';

export function generateRandomString(length: number = RANDOM_STRING_LENGTH): string {
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let randomString = '';
  for (let i = 0; i < length; i++) randomString += characters[Math.floor(Math.random() * characters.length)];

  return randomString;
}

export function generateRandomInteger(min: number = MIN_RANDOM_INTEGER, max: number = MAX_RANDOM_INTEGER): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateRandomEmail(
  domain: string = TEST_EMAIL_DOMAIN,
  usernameLength: number = RANDOM_EMAIL_USERNAME_LENGTH,
): string {
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let username = '';
  for (let i = 0; i < usernameLength; i++) username += characters[Math.floor(Math.random() * characters.length)];

  return `${username}@${domain}`;
}

export function generateRandomValue(dataType: DataType): string | null {
  if (dataType === 'random32') return generateRandomString();
  if (dataType === 'randomInt') return String(generateRandomInteger());
  if (dataType === 'randomEmail') return generateRandomEmail();

  return null;
}
