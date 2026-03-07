import type { RentgenBundle, BundleRequest, BundleRunResult, BundleRequestResult } from '../../shared/types/bundle';
import { HttpClient } from '../http/client';
import type { HttpResponse } from '../http/client';
import { VariableStore } from '../config/variables';
import { extractDynamicVariable } from './extractor';

export interface RunnerOptions {
  stopOnFailure: boolean;
  timeout: number;
  verbose: boolean;
}

type ResultCallback = (result: BundleRequestResult, index: number, total: number) => void;

export class SequentialRunner {
  private httpClient: HttpClient;
  private results: BundleRequestResult[] = [];
  private resultCallback: ResultCallback | null = null;
  private aborted = false;

  constructor(
    private bundle: RentgenBundle,
    private options: RunnerOptions,
    private variableStore: VariableStore,
  ) {
    this.httpClient = new HttpClient(options.timeout);
  }

  onResult(callback: ResultCallback): void {
    this.resultCallback = callback;
  }

  abort(): void {
    this.aborted = true;
  }

  /** Build a partial summary from results collected so far */
  getPartialSummary(): BundleRunResult {
    return this.buildSummary(0);
  }

  async run(): Promise<BundleRunResult> {
    const startTime = performance.now();
    const total = this.bundle.requests.length;

    for (let i = 0; i < this.bundle.requests.length; i++) {
      if (this.aborted) break;

      const request = this.bundle.requests[i];
      const result = await this.executeRequest(request);
      this.results.push(result);

      if (this.resultCallback) {
        this.resultCallback(result, i + 1, total);
      }

      if (!result.success && this.options.stopOnFailure) {
        break;
      }
    }

    const duration = performance.now() - startTime;
    return this.buildSummary(duration);
  }

  private async executeRequest(request: BundleRequest): Promise<BundleRequestResult> {
    // 1. Substitute variables in request
    const resolved = this.variableStore.substituteRequest(request);

    // 2. Convert headers array to Record
    const headers: Record<string, string> = {};
    for (const h of resolved.headers) {
      headers[h.key] = h.value;
    }

    // 3. Send HTTP request
    let response: HttpResponse;
    try {
      response = await this.httpClient.send({
        method: resolved.method,
        url: resolved.url,
        headers,
        body: resolved.body,
      });
    } catch (error) {
      return {
        requestId: request.id,
        requestName: request.name,
        method: request.method,
        url: resolved.url,
        status: null,
        statusText: 'Network Error',
        success: false,
        duration: 0,
        error: error instanceof Error ? error.message : String(error),
        dynamicVarsExtracted: [],
        dynamicVarsFailed: [],
      };
    }

    // 4. Extract dynamic variables linked to this request
    const dvarsExtracted: { key: string; value: string }[] = [];
    const dvarsFailed: { key: string; error: string }[] = [];
    const dynamicVarDetails: NonNullable<BundleRequestResult['verbose']>['dynamicVarDetails'] = [];

    const dvars = this.variableStore.getDynamicVarsForRequest(request.id);
    for (const dvar of dvars) {
      const extraction = extractDynamicVariable(dvar, response);
      if (extraction.success && extraction.value !== null) {
        this.variableStore.updateDynamicValue(dvar.key, extraction.value);
        dvarsExtracted.push({ key: dvar.key, value: extraction.value });
        dynamicVarDetails.push({
          key: dvar.key,
          selector: dvar.selector,
          source: dvar.source,
          extracted: true,
          value: extraction.value,
        });
      } else {
        dvarsFailed.push({ key: dvar.key, error: extraction.error ?? 'Unknown error' });
        dynamicVarDetails.push({
          key: dvar.key,
          selector: dvar.selector,
          source: dvar.source,
          extracted: false,
          error: extraction.error ?? 'Unknown error',
        });
      }
    }

    // 5. Determine success (2xx = success)
    const success = response.statusCode >= 200 && response.statusCode < 300;

    const result: BundleRequestResult = {
      requestId: request.id,
      requestName: request.name,
      method: request.method,
      url: resolved.url,
      status: response.statusCode,
      statusText: response.status,
      success,
      duration: response.duration,
      error: null,
      dynamicVarsExtracted: dvarsExtracted,
      dynamicVarsFailed: dvarsFailed,
    };

    // 6. Attach verbose data when enabled
    if (this.options.verbose) {
      result.verbose = {
        requestHeaders: headers,
        requestBody: resolved.body,
        responseHeaders: response.headers,
        responseBody: response.body,
        dynamicVarDetails,
      };
    }

    return result;
  }

  private buildSummary(duration: number): BundleRunResult {
    return {
      success: this.results.length > 0 && this.results.every((r) => r.success),
      totalRequests: this.results.length,
      passed: this.results.filter((r) => r.success).length,
      failed: this.results.filter((r) => !r.success && !r.error).length,
      errors: this.results.filter((r) => r.error !== null).length,
      duration: Math.round(duration),
      results: this.results,
    };
  }
}
