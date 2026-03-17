import { Method } from 'axios';

export type DataType =
  | 'email'
  | 'enum'
  | 'url'
  | 'ftp_url'
  | 'phone'
  | 'number'
  | 'boolean'
  | 'currency'
  | 'date_yyyy_mm_dd'
  | 'string'
  | 'do-not-test'
  | 'randomString'
  | 'randomInt'
  | 'randomEmail';

export type ParameterType = 'body' | 'query';

export type ReportFormat = 'json' | 'md' | 'csv';

export interface DynamicValue {
  mandatory?: boolean;
  type: DataType;
  value?: number | string | Interval;
}

export interface HttpRequest {
  body?: Record<string, unknown> | string | Uint8Array | null;
  headers: Record<string, string>;
  method: Method | string;
  url: string;
}

export interface HttpResponse {
  body: string;
  headers: Record<string, string>;
  status: string;
  time: number;
}

export interface Interval {
  min: number;
  max: number;
}

export interface ParsedCurlResult {
  body: string | null;
  decodedLines: string[];
  headers: Record<string, string>;
  method: string;
  url: string;
}

export interface RequestParameters {
  [key: string]: DynamicValue;
}

export interface TestData {
  value: any;
  valid: boolean;
}

export interface TestOptions {
  body: string | null;
  bodyParameters: RequestParameters;
  headers: string;
  method: Method | string;
  messageType: string;
  parameterName?: string;
  parameterType?: ParameterType;
  protoFile: File | null;
  queryParameters: RequestParameters;
  testData?: TestData;
  url: string;
}

export interface TestResult {
  actual: string;
  expected: string;
  name?: string;
  request?: HttpRequest | null;
  response?: HttpResponse | null;
  status: TestStatus;
  value?: any;
}

export interface TestResults {
  timestamp: number | null;
  count: number;
  crudTests: TestResult[];
  dataDrivenTests: TestResult[];
  performanceTests: TestResult[];
  securityTests: TestResult[];
  testOptions: TestOptions | null;
}

export enum TestStatus {
  Bug = '🟣 Bug',
  Fail = '🔴 Fail',
  FailNoResponse = '🔴 Fail (No response)',
  Info = '🔵 Info',
  Manual = '⚪ Manual',
  Pass = '🟢 Pass',
  Warning = '🟠 Warning',
}

export interface ReportSuite {
  name: string;
  summary: { total: number; byStatus: Record<string, number> };
  tests: TestResult[];
}

export interface ExportReport {
  generatedAt: string;
  generatedBy: string;
  target: {
    url: string;
    method: Method | string;
    headers: Record<string, string>;
    body: any;
    messageType: string;
    protoFileName: string | null;
  };
  lastHttpResponse: HttpResponse | null;
  suites: ReportSuite[];
}

export * from './environment';
export * from './ipc';
export * from './postman';
export * from './postman-full';
