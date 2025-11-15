export function setDeepObjectProperty(targetObject: any, propertyPath: string, newValue: any): void {
  const pathParts = propertyPath.replace(/\[(\d+)\]/g, '.$1').split('.');
  let currentObject = targetObject;

  for (let i = 0; i < pathParts.length - 1; i++) {
    const currentKey = pathParts[i];
    if (!(currentKey in currentObject)) currentObject[currentKey] = {};

    currentObject = currentObject[currentKey];
  }

  currentObject[pathParts[pathParts.length - 1]] = newValue;
}

export function truncateValue(value: any, maxLength = 100): string {
  // Handle null and undefined cases explicitly
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';

  let formattedString: string;

  switch (typeof value) {
    case 'string':
      formattedString = `"${value}"`;
      break;
    case 'number':
    case 'boolean':
      formattedString = String(value);
      break;
    case 'object':
      try {
        formattedString = JSON.stringify(value);
      } catch {
        formattedString = '[object]';
      }
      break;
    default:
      formattedString = String(value);
  }

  if (formattedString.length > maxLength) {
    const truncationSuffix = ' ...';
    const availableLength = maxLength - truncationSuffix.length;
    return formattedString.slice(0, Math.max(0, availableLength)) + truncationSuffix;
  }

  return formattedString;
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

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
