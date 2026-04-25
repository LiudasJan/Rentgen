export interface RequestResult {
  requestId: string;
  requestName: string;
  method: string;
  url: string;
  status: number | null;
  statusText: string;
  success: boolean;
  duration: number;
  error: string | null;
  dynamicVarsExtracted: { key: string; value: string }[];
  dynamicVarsFailed: { key: string; error: string }[];
  verbose?: VerboseDetails;
}

export interface VerboseDetails {
  requestHeaders: Record<string, string>;
  requestBody?: string;
  responseHeaders: Record<string, string>;
  responseBody: string;
  dynamicVarDetails: DynamicVarDetail[];
  unresolvedVariables: string[];
}

export interface DynamicVarDetail {
  key: string;
  selector: string;
  source: 'body' | 'header';
  extracted: boolean;
  value?: string;
  error?: string;
}

export interface RunResult {
  success: boolean;
  totalRequests: number;
  passed: number;
  failed: number;
  errors: number;
  duration: number;
  results: RequestResult[];
}
