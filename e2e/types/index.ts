import { ElectronApplication, Page } from 'playwright';

export interface TestContext {
  page: Page;
  electronApp: ElectronApplication;
}

export interface MockServerConfig {
  baseUrl: string;
  wsUrl: string;
}

export interface RequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';
  url: string;
  headers?: string;
  body?: string;
}

export interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'skip' | 'warning';
  duration: number;
  error?: string;
}

export interface EnvironmentVariable {
  key: string;
  value: string;
}

export interface CollectionRequest {
  id: string;
  name: string;
  url: string;
  method: string;
  headers?: string;
  body?: string;
}

export interface Collection {
  id: string;
  name: string;
  requests: CollectionRequest[];
  folders?: Collection[];
}

export interface SecurityTestResult {
  name: string;
  passed: boolean;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  recommendation?: string;
}
