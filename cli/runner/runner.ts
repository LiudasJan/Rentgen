import type { Environment } from '../../shared/types/environment';
import type { PostmanFolder, PostmanItem } from '../../shared/types/postman';
import { HttpClient, type HttpResponse } from '../http/client';
import { VariableStore } from '../config/variables';
import { extractDynamicVariable } from './extractor';
import type { DynamicVarDetail, RequestResult, RunResult } from './types';

export interface RunnerOptions {
  failFast: boolean;
  timeout: number;
  verbose: boolean;
}

type ResultCallback = (result: RequestResult, index: number, total: number) => void;

export class SequentialRunner {
  private httpClient: HttpClient;
  private results: RequestResult[] = [];
  private resultCallback: ResultCallback | null = null;
  private aborted = false;

  constructor(
    private folder: PostmanFolder,
    private environment: Environment | null,
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

  getPartialSummary(): RunResult {
    return this.buildSummary(0);
  }

  async run(): Promise<RunResult> {
    const startTime = performance.now();
    const items = this.folder.item;
    const total = items.length;

    for (let i = 0; i < items.length; i++) {
      if (this.aborted) break;

      const result = await this.executeItem(items[i]);
      this.results.push(result);

      this.resultCallback?.(result, i + 1, total);

      if (!result.success && this.options.failFast) break;
    }

    return this.buildSummary(performance.now() - startTime);
  }

  private async executeItem(item: PostmanItem): Promise<RequestResult> {
    const resolved = this.variableStore.substituteRequest(item);
    const unresolvedNow = this.variableStore.getLastUnresolved();

    const headers: Record<string, string> = {};
    for (const h of resolved.headers) headers[h.key] = h.value;

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
        requestId: item.id,
        requestName: item.name,
        method: item.request.method,
        url: resolved.url,
        status: null,
        statusText: 'Network Error',
        success: false,
        duration: 0,
        error: error instanceof Error ? error.message : String(error),
        dynamicVarsExtracted: [],
        dynamicVarsFailed: [],
        ...(this.options.verbose && {
          verbose: {
            requestHeaders: headers,
            requestBody: resolved.body,
            responseHeaders: {},
            responseBody: '',
            dynamicVarDetails: [],
            unresolvedVariables: unresolvedNow,
          },
        }),
      };
    }

    const dvarsExtracted: { key: string; value: string }[] = [];
    const dvarsFailed: { key: string; error: string }[] = [];
    const dynamicVarDetails: DynamicVarDetail[] = [];

    for (const dvar of this.variableStore.getDynamicVarsForRequest(item.id)) {
      const outcome = extractDynamicVariable(dvar, response);
      if (outcome.success && outcome.value !== null) {
        this.variableStore.update(dvar.key, outcome.value);
        dvarsExtracted.push({ key: dvar.key, value: outcome.value });
        dynamicVarDetails.push({
          key: dvar.key,
          selector: dvar.selector,
          source: dvar.source,
          extracted: true,
          value: outcome.value,
        });
      } else {
        dvarsFailed.push({ key: dvar.key, error: outcome.error ?? 'Unknown error' });
        dynamicVarDetails.push({
          key: dvar.key,
          selector: dvar.selector,
          source: dvar.source,
          extracted: false,
          error: outcome.error ?? 'Unknown error',
        });
      }
    }

    const success = response.statusCode >= 200 && response.statusCode < 300;

    const result: RequestResult = {
      requestId: item.id,
      requestName: item.name,
      method: item.request.method,
      url: resolved.url,
      status: response.statusCode,
      statusText: response.status,
      success,
      duration: response.duration,
      error: null,
      dynamicVarsExtracted: dvarsExtracted,
      dynamicVarsFailed: dvarsFailed,
    };

    if (this.options.verbose) {
      result.verbose = {
        requestHeaders: headers,
        requestBody: resolved.body,
        responseHeaders: response.headers,
        responseBody: response.body,
        dynamicVarDetails,
        unresolvedVariables: unresolvedNow,
      };
    }

    return result;
  }

  private buildSummary(duration: number): RunResult {
    const results = this.results;
    return {
      success: results.length > 0 && results.every((r) => r.success),
      totalRequests: results.length,
      passed: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success && !r.error).length,
      errors: results.filter((r) => r.error !== null).length,
      duration: Math.round(duration),
      results,
    };
  }
}
