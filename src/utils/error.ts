/**
 * Throws a new Error with the specified message and never returns
 *
 * This utility function provides a consistent way to throw errors throughout the application.
 * The `never` return type indicates that this function never returns normally, making it
 * useful for TypeScript's control flow analysis and ensuring proper type checking in
 * scenarios where execution should halt.
 *
 * Benefits:
 * - Consistent error throwing pattern across the codebase
 * - TypeScript `never` type for better static analysis
 * - Centralized error creation for potential future enhancements
 * - Clear intention when terminating execution flow
 *
 * @param message - The error message to display when the error is thrown
 * @throws {Error} Always throws an Error with the provided message
 * @returns {never} This function never returns as it always throws
 */
export function throwError(message: string): never {
  throw new Error(message);
}
