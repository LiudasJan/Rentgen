// ---------------------------------------------------------------------------
// Rentgen Bundle Format v1.0.0
// Self-contained snapshot for CLI replay of a collection folder run.
// The CLI must NEVER write back to the bundle file — dynamic variables
// update in-memory only during execution.
// ---------------------------------------------------------------------------

// ── Bundle top-level ────────────────────────────────────────────────────────

export interface RentgenBundle {
  version: string;
  exportedAt: string;
  exportedBy: string;
  source: BundleSource;
  requests: BundleRequest[];
  /** Flat key-value map of environment variables (already resolved at export time) */
  variables: Record<string, string>;
  /** Dynamic variables with their initial (snapshot) values */
  dynamicVariables: BundleDynamicVariable[];
}

export interface BundleSource {
  folderName: string;
  folderId: string;
  totalRequests: number;
}

export interface BundleRequest {
  id: string;
  name: string;
  method: string;
  url: string;
  headers: BundleHeader[];
  body?: string;
  order: number;
}

export interface BundleHeader {
  key: string;
  value: string;
}

export interface BundleDynamicVariable {
  id: string;
  /** Variable name used in {{variable}} syntax */
  key: string;
  /** JSON-path (body) or header name (header) extraction selector */
  selector: string;
  source: 'body' | 'header';
  /** ID of the request this variable extracts from */
  requestId: string;
  /** Snapshot value at export time (null if never extracted) */
  initialValue: string | null;
}

// ── Run result types (CLI output) ───────────────────────────────────────────

export interface BundleRunResult {
  success: boolean;
  totalRequests: number;
  passed: number;
  failed: number;
  errors: number;
  /** Total run duration in ms */
  duration: number;
  results: BundleRequestResult[];
}

export interface BundleRequestResult {
  requestId: string;
  requestName: string;
  method: string;
  url: string;
  status: number | null;
  statusText: string;
  /** true when HTTP status is 2xx */
  success: boolean;
  /** Request duration in ms */
  duration: number;
  error: string | null;
  dynamicVarsExtracted: { key: string; value: string }[];
  dynamicVarsFailed: { key: string; error: string }[];
  /** Populated when --verbose is set */
  verbose?: {
    requestHeaders: Record<string, string>;
    requestBody?: string;
    responseHeaders: Record<string, string>;
    responseBody: string;
    dynamicVarDetails: {
      key: string;
      selector: string;
      source: 'body' | 'header';
      extracted: boolean;
      value?: string;
      error?: string;
    }[];
  };
}
