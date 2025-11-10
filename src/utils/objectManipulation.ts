/**
 * Sets a value at a deep path within an object, creating nested objects as needed
 *
 * This function supports both dot notation and array bracket notation for paths.
 * Examples:
 * - 'user.profile.name' sets obj.user.profile.name
 * - 'items[0].id' sets obj.items[0].id
 * - 'config.settings.theme' sets obj.config.settings.theme
 *
 * @param targetObject - The object to modify
 * @param propertyPath - Dot-notation path to the property (e.g., 'user.profile.name' or 'items[0].id')
 * @param newValue - The value to set at the specified path
 */
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
