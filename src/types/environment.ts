/**
 * Environment variable key-value pair
 */
export interface EnvironmentVariable {
  key: string;
  value: string;
}

/**
 * Single environment definition
 */
export interface Environment {
  id: string;
  title: string;
  color: string;
  variables: EnvironmentVariable[];
}

/**
 * Dynamic variable that extracts values from API responses
 */
export interface DynamicVariable {
  /** Unique identifier: "dvar_{timestamp}_{random}" */
  id: string;

  /** Variable name used in {{variable}} syntax */
  key: string;

  /**
   * Extraction path:
   * - For body: dot/bracket notation (e.g., "data.user.id", "items[0].name")
   * - For header: header name (e.g., "X-Request-Id", "Authorization")
   */
  selector: string;

  /** Where to extract the value from */
  source: 'body' | 'header';

  /** ID of the collection containing the linked request */
  collectionId: string;

  /** ID of the linked request within the collection */
  requestId: string;

  /** Last successfully extracted value (null if never extracted) */
  currentValue: string | null;

  /** Timestamp of last successful extraction (null if never extracted) */
  lastUpdated: number | null;

  /**
   * Environment scope:
   * - null: Applies to ALL environments
   * - string: Applies only to specific environment ID
   */
  environmentId: string | null;
}
