import chalk from 'chalk';
import type { RentgenBundle, BundleRunResult, BundleRequestResult } from '../../shared/types/bundle';

export class ConsoleReporter {
  constructor(private options: { verbose: boolean; noColor: boolean }) {
    if (options.noColor) {
      chalk.level = 0;
    }
  }

  printHeader(bundle: RentgenBundle): void {
    process.stdout.write(chalk.bold('Rentgen CLI v1.0.0') + '\n');
    process.stdout.write('\n');
    process.stdout.write(`Bundle:  ${bundle.source.folderName} (${bundle.source.totalRequests} requests)\n`);
    process.stdout.write(`Source:  ${bundle.exportedBy || 'rentgen.bundle.json'}\n`);
    process.stdout.write(chalk.dim('─'.repeat(40)) + '\n');
    process.stdout.write('\n');
  }

  printResult(result: BundleRequestResult, index: number, total: number): void {
    const tag = `[${index}/${total}]`;
    const methodUrl = `${result.method} ${result.url}`;
    process.stdout.write(`${tag} ${methodUrl}\n`);

    if (result.error) {
      // Network error — show first line with symbol, indent remaining lines
      const lines = result.error.split('\n');
      process.stdout.write(`      ${chalk.red('✗')} ${chalk.red(`Network Error: ${lines[0]}`)}\n`);
      for (let i = 1; i < lines.length; i++) {
        process.stdout.write(`        ${chalk.dim(lines[i])}\n`);
      }
    } else if (result.success) {
      process.stdout.write(`      ${chalk.green('✓')} ${chalk.green(result.statusText)} ${chalk.dim(`(${result.duration}ms)`)}\n`);
    } else {
      process.stdout.write(`      ${chalk.red('✗')} ${chalk.red(result.statusText)} ${chalk.dim(`(${result.duration}ms)`)}\n`);
    }

    if (this.options.verbose && result.verbose) {
      this.printVerboseDetails(result.verbose);
    }

    process.stdout.write('\n');
  }

  printSummary(result: BundleRunResult): void {
    process.stdout.write(chalk.dim('─'.repeat(40)) + '\n');

    const resultParts = [
      result.passed > 0 ? chalk.green(`${result.passed} passed`) : `${result.passed} passed`,
      result.failed > 0 ? chalk.red(`${result.failed} failed`) : `${result.failed} failed`,
    ];
    if (result.errors > 0) {
      resultParts.push(chalk.red(`${result.errors} errors`));
    }

    process.stdout.write(`Results: ${resultParts.join(', ')}\n`);
    process.stdout.write(`Duration: ${this.formatDuration(result.duration)}\n`);

    // List failed requests
    const failed = result.results.filter(r => !r.success);
    if (failed.length > 0) {
      process.stdout.write('\n');
      process.stdout.write(chalk.red('Failed:') + '\n');
      for (const r of failed) {
        const idx = result.results.indexOf(r) + 1;
        const total = result.totalRequests;
        const path = this.extractPath(r.url);
        const errorFirstLine = r.error?.split('\n')[0] ?? '';
        const reason = r.error
          ? `Network Error: ${errorFirstLine}`
          : r.statusText;
        process.stdout.write(`  [${idx}/${total}] ${r.method} ${path} — ${reason}\n`);
      }
    }
  }

  private printVerboseDetails(verbose: BundleRequestResult['verbose']): void {
    if (!verbose) return;

    // Request headers
    process.stdout.write(chalk.dim('      Request Headers:') + '\n');
    for (const [key, value] of Object.entries(verbose.requestHeaders)) {
      process.stdout.write(chalk.dim(`        ${key}: ${value}`) + '\n');
    }

    // Request body
    if (verbose.requestBody) {
      process.stdout.write(chalk.dim('      Request Body:') + '\n');
      process.stdout.write(chalk.dim(`        ${this.truncate(verbose.requestBody, 500)}`) + '\n');
    }

    // Response headers
    process.stdout.write(chalk.dim('      Response Headers:') + '\n');
    for (const [key, value] of Object.entries(verbose.responseHeaders)) {
      process.stdout.write(chalk.dim(`        ${key}: ${value}`) + '\n');
    }

    // Response body
    process.stdout.write(chalk.dim('      Response Body:') + '\n');
    process.stdout.write(chalk.dim(`        ${this.truncate(verbose.responseBody, 1000)}`) + '\n');

    // Dynamic variables
    if (verbose.dynamicVarDetails.length > 0) {
      process.stdout.write(chalk.dim('      Dynamic Variables:') + '\n');
      for (const dv of verbose.dynamicVarDetails) {
        if (dv.extracted) {
          process.stdout.write(`        ${chalk.green('✓')} ${chalk.dim(`${dv.key} = "${dv.value}" (extracted from ${dv.source}: ${dv.selector})`)}\n`);
        } else {
          process.stdout.write(`        ${chalk.yellow('⚠')} ${chalk.yellow(`${dv.key} — ${dv.error}`)}\n`);
        }
      }
    }
  }

  private truncate(text: string, maxLen: number): string {
    if (text.length <= maxLen) return text;
    return text.slice(0, maxLen) + '… (truncated)';
  }

  private formatDuration(ms: number): string {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  }

  private extractPath(url: string): string {
    try {
      return new URL(url).pathname;
    } catch {
      return url;
    }
  }
}
