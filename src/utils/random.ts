import { store } from '../store';
import { DataType } from '../types';

export function generateRandomString(length: number): string {
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let randomString = '';
  for (let i = 0; i < length; i++) randomString += characters[Math.floor(Math.random() * characters.length)];

  return randomString;
}

export function generateRandomNumber(min: number, max: number): number {
  if (Number.isInteger(min) && Number.isInteger(max)) return Math.floor(Math.random() * (max - min + 1)) + min;

  return parseFloat((Math.random() * (max - min) + min).toFixed(2));
}

export function generateRandomEmail(domain: string, usernameLength: number): string {
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let username = '';
  for (let i = 0; i < usernameLength; i++) username += characters[Math.floor(Math.random() * characters.length)];

  return `${username}@${domain}`;
}

export function generateRandomValue(dataType: DataType): string | number | null {
  const settings = store.getState().settings.testEngine.configuration;

  if (dataType === 'randomString') return generateRandomString(settings.randomString.length);
  if (dataType === 'randomInt') return generateRandomNumber(settings.randomInt.min, settings.randomInt.max);
  if (dataType === 'randomEmail') return generateRandomEmail(settings.randomEmail.domain, settings.randomEmail.length);

  return null;
}
