export const fieldDetectors: { type: string; regex: RegExp }[] = [
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

export function detectFieldType(key: string, value: any): string {
  if (typeof value === 'boolean') return 'boolean';
  if (typeof value === 'number') return 'number';

  if (typeof value === 'string') {
    for (const detector of fieldDetectors) {
      if (detector.regex.test(value)) {
        return detector.type;
      }
    }
  }

  return 'string';
}
