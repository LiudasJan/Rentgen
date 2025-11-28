import { DataType } from '../types';

const DATA_TYPE_DETECTORS: ReadonlyArray<{
  type: DataType;
  regex: RegExp;
}> = [
  { type: 'email', regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  { type: 'url', regex: /^https?:\/\/[^\s$.?#].[^\s]*$/i },
  { type: 'ftp_url', regex: /^ftp:\/\/[^\s$.?#].[^\s]*$/i },
  { type: 'phone', regex: /^\+\d{7,20}$/ },
  { type: 'number', regex: /^-?\d+(\.\d+)?$/ },
  { type: 'boolean', regex: /^(true|false)$/i },
  { type: 'currency', regex: /^[A-Z]{3}$/ },
  { type: 'date_yyyy_mm_dd', regex: /^\d{4}-\d{2}-\d{2}$/ },
  { type: 'string', regex: /.+/ },
];

export function detectDataType(value: unknown, strict = false): DataType {
  if (typeof value === 'boolean') return 'boolean';
  if (typeof value === 'number') return 'number';
  if (typeof value === 'string' && value.length > 0) {
    if (strict && !isNaN(Number(value)) && !isPhoneNumber(value)) return 'string';

    for (const detector of DATA_TYPE_DETECTORS) if (detector.regex.test(value)) return detector.type;
  }

  return 'string';
}

export function isPhoneNumber(value: string): boolean {
  return DATA_TYPE_DETECTORS.find((detector) => detector.type === 'phone')?.regex.test(value);
}

export function extractPropertiesFromJson(obj: unknown, prefix = ''): Record<string, string> {
  const properties: Record<string, string> = {};

  if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
    for (const [key, value] of Object.entries(obj)) {
      const path = prefix ? `${prefix}.${key}` : key;

      if (value === null) properties[path] = 'null';
      else if (typeof value === 'object') {
        // Mark this object property as not testable (objects are not tested directly, only their children)
        properties[path] = 'DO_NOT_TEST';
        Object.assign(properties, extractPropertiesFromJson(value, path));
      } else properties[path] = typeof value;
    }
  } else if (Array.isArray(obj)) {
    obj.forEach((item, i) => {
      const path = `${prefix}[${i}]`;
      if (typeof item === 'object') {
        properties[path] = 'DO_NOT_TEST';
        Object.assign(properties, extractPropertiesFromJson(item, path));
      } else properties[path] = typeof item;
    });
  } else properties[prefix] = typeof obj;

  return properties;
}
