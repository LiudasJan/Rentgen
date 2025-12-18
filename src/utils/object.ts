import { isPhoneNumber } from './validation';

export function containsArray(value: string): boolean {
  let parsed;

  try {
    parsed = JSON.parse(value);
  } catch {
    return false;
  }

  function check(value: any): boolean {
    if (Array.isArray(value)) return true;
    if (value !== null && typeof value === 'object') return Object.values(value).some(check);

    return false;
  }

  return check(parsed);
}

export function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function setDeepObjectProperty(targetObject: any, propertyPath: string, newValue: any): void {
  const pathParts = propertyPath.replace(/\[(\d+)\]/g, '.$1').split('.');
  let currentObject = targetObject;

  for (const key of pathParts.slice(0, -1)) {
    if (!(key in currentObject)) currentObject[key] = {};
    currentObject = currentObject[key];
  }

  currentObject[pathParts[pathParts.length - 1]] = newValue;
}

export function stringifyValue(value: any): string {
  if (
    (typeof value === 'string' &&
      (value === 'false' || value === 'true' || (!isNaN(Number(value)) && !isPhoneNumber(String(value))))) ||
    isObject(value) ||
    Array.isArray(value)
  )
    return JSON.stringify(value);

  return String(value);
}

export function truncateValue(value: any, maxLength = 100): string {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';

  const stringValue = typeof value === 'string' ? JSON.stringify(value) : stringifyValue(value);
  if (stringValue.length > maxLength) {
    const truncationSuffix = '...';
    const availableLength = maxLength - truncationSuffix.length;

    return stringValue.slice(0, Math.max(0, availableLength)) + truncationSuffix;
  }

  return stringValue;
}

export function tryParseJsonObject(value: any): any {
  if (isObject(value)) return value;
  if (typeof value !== 'string') return value;

  try {
    const parsed = JSON.parse(value);
    if (isObject(parsed)) return parsed;

    return value;
  } catch {
    return value;
  }
}
