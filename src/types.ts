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

export interface Test {
  actual: string;
  expected: string;
  decoded?: string | null;
  field?: string;
  method?: Method | string;
  name?: string;
  request?: TestRequest | null;
  response?: any | null;
  responseTime?: number;
  status: TestStatus;
  value?: any;
}

export interface TestRequest {
  body?: string;
  headers: any;
  method?: Method | string;
  url: string;
}
