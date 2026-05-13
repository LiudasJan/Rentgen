import { version } from '../../package.json';
import type { RequestResult, RunResult } from '../runner/types';
import type { HeaderContext } from './console';

export interface JsonReport {
  cliVersion: string;
  project: string;
  folder: string;
  environment: string | null;
  totalRequests: number;
  passed: number;
  failed: number;
  errors: number;
  duration: number;
  success: boolean;
  results: RequestResult[];
}

export class JsonReporter {
  constructor(private header: HeaderContext) {}

  printSummary(result: RunResult): void {
    const report: JsonReport = {
      cliVersion: version,
      project: this.header.projectName,
      folder: this.header.folderName,
      environment: this.header.environmentTitle,
      totalRequests: result.totalRequests,
      passed: result.passed,
      failed: result.failed,
      errors: result.errors,
      duration: result.duration,
      success: result.success,
      results: result.results,
    };
    process.stdout.write(JSON.stringify(report) + '\n');
  }
}
