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
  | 'random32'
  | 'randomInt'
  | 'randomEmail';

export type ParameterType = 'body' | 'query';

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
  body?: string;
  headers: Record<string, string>;
  status: string;
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
  responseTime?: number;
  status: TestStatus;
  value?: any;
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

export * from './environment';
export * from './postman';
