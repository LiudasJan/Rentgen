export const fieldDetectors: { type: string; regex: RegExp }[] = [
  { type: "email", regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  { type: "url", regex: /^https?:\/\/[^\s$.?#].[^\s]*$/i },
  { type: "phone", regex: /^\+?[0-9\s\-()]{7,20}$/ },
  { type: "number", regex: /^-?\d+(\.\d+)?$/ },
  { type: "string", regex: /.+/ },
];

export function detectFieldType(key: string, value: any): string {
  if (typeof value === "string") {
    for (const detector of fieldDetectors) {
      if (detector.regex.test(value)) {
        return detector.type;
      }
    }
  }
  if (typeof value === "number") return "number";
  return "string";
}
