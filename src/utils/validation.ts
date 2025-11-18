import { extractStatusCode } from '.';
import { RESPONSE_STATUS } from '../constants/responseStatus';
import { FieldDetector, FieldType, HttpResponse, TestStatus } from '../types';

const fieldDetectors: ReadonlyArray<FieldDetector> = [
  { type: 'email', regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  { type: 'url', regex: /^https?:\/\/[^\s$.?#].[^\s]*$/i },
  { type: 'ftp_url', regex: /^ftp:\/\/[^\s$.?#].[^\s]*$/i },
  { type: 'phone', regex: /^\+?\d{7,20}$/ },
  { type: 'number', regex: /^-?\d+(\.\d+)?$/ },
  { type: 'boolean', regex: /^(true|false)$/i },
  { type: 'currency', regex: /^[A-Z]{3}$/ },
  { type: 'date_yyyy_mm_dd', regex: /^\d{4}-\d{2}-\d{2}$/ },
  { type: 'string', regex: /.+/ },
];

export function detectFieldType(value: unknown, strict = false): FieldType {
  if (typeof value === 'boolean') return 'boolean';
  if (typeof value === 'number') return 'number';
  if (typeof value === 'string' && value.length > 0) {
    if (
      strict &&
      !isNaN(Number(value)) &&
      !fieldDetectors.find((detector) => detector.type === 'phone')?.regex.test(value)
    )
      return 'string';

    for (const detector of fieldDetectors) if (detector.regex.test(value)) return detector.type;
  }

  return 'string';
}

export function extractFieldsFromJson(obj: unknown, prefix = ''): Record<string, string> {
  const fields: Record<string, string> = {};

  if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
    for (const [key, value] of Object.entries(obj)) {
      const path = prefix ? `${prefix}.${key}` : key;

      if (value === null) fields[path] = 'null';
      else if (typeof value === 'object') {
        // Mark this object field as not testable (objects are not tested directly, only their children)
        fields[path] = 'DO_NOT_TEST';
        Object.assign(fields, extractFieldsFromJson(value, path));
      } else fields[path] = typeof value;
    }
  } else if (Array.isArray(obj)) {
    obj.forEach((item, i) => {
      const path = `${prefix}[${i}]`;
      if (typeof item === 'object') {
        fields[path] = 'DO_NOT_TEST';
        Object.assign(fields, extractFieldsFromJson(item, path));
      } else fields[path] = typeof item;
    });
  } else fields[prefix] = typeof obj;

  return fields;
}

export function determineTestStatus(
  response: HttpResponse,
  determine: (response: HttpResponse, statusCode: number) => { actual: string; status: TestStatus },
): {
  actual: string;
  status: TestStatus;
} {
  const statusCode = extractStatusCode(response);
  if (statusCode >= RESPONSE_STATUS.SERVER_ERROR) return { actual: response.status, status: TestStatus.Bug };

  return determine(response, statusCode);
}
