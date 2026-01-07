import { PostmanCollection } from './postman';

export interface ImportResult {
  canceled?: boolean;
  success?: boolean;
  error?: string;
  collection?: PostmanCollection;
  warnings?: string[];
  fileName?: string;
}

export interface ExportResult {
  canceled?: boolean;
  success?: boolean;
  error?: string;
  filePath?: string;
}
