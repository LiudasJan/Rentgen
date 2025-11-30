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

export function generateRandomNumber(min: number = MIN_RANDOM_INTEGER, max: number = MAX_RANDOM_INTEGER): number {
  if (Number.isInteger(min) && Number.isInteger(max)) return Math.floor(Math.random() * (max - min + 1)) + min;

  return parseFloat((Math.random() * (max - min) + min).toFixed(2));
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

export function generateRandomValue(dataType: DataType): string | number | null {
  if (dataType === 'random32') return generateRandomString();
  if (dataType === 'randomInt') return generateRandomNumber();
  if (dataType === 'randomEmail') return generateRandomEmail();

  return null;
}
