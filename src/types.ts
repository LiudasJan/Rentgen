import { Method } from 'axios';

export enum TestStatus {
  Bug = '🔴 Bug',
  Fail = '🔴 Fail',
  FailNoResponse = '🔴 Fail (No response)',
  Info = '🔵 Info',
  Manual = '⚪ Manual',
  Pass = '🟢 Pass',
  Warning = '🟠 Warning',
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

export interface TestData {
  value: any;
  valid: boolean;
}

export interface HttpRequest {
  body?: Record<string, unknown> | string | Uint8Array | null;
  headers: Record<string, string>;
  method: Method | string;
  url: string;
}
