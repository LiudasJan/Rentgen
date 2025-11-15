import { Method } from 'axios';

export interface FieldDetector {
  type: FieldType;
  regex: RegExp;
}

export type FieldType =
  | 'email'
  | 'url'
  | 'ftp_url'
  | 'phone'
  | 'number'
  | 'boolean'
  | 'currency'
  | 'date_yyyy_mm_dd'
  | 'string'
  | 'do-not-test'
  | 'random32'
  | 'randomInt'
  | 'randomEmail';

export interface HttpRequest {
  body?: Record<string, unknown> | string | Uint8Array | null;
  headers: Record<string, string>;
  method: Method | string;
  url: string;
}

export interface ParsedCurlResult {
  body: string | null;
  decodedLines: string[];
  headers: Record<string, string>;
  method: string;
  url: string;
}

export interface TestData {
  value: any;
  valid: boolean;
}

export interface TestResult {
  actual: string;
  expected: string;
  decoded?: string | null;
  field?: string;
  method?: Method | string;
  name?: string;
  request?: HttpRequest | null;
  response?: any | null;
  responseTime?: number;
  status: TestStatus;
  value?: any;
}

export enum TestStatus {
  Bug = '🔴 Bug',
  Fail = '🔴 Fail',
  FailNoResponse = '🔴 Fail (No response)',
  Info = '🔵 Info',
  Manual = '⚪ Manual',
  Pass = '🟢 Pass',
  Warning = '🟠 Warning',
}
