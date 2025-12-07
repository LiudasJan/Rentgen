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
