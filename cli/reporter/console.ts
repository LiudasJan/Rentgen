import chalk from 'chalk';
import { version } from '../../package.json';
import type { RequestResult, RunResult, VerboseDetails } from '../runner/types';

export interface HeaderContext {
  projectName: string;
  folderName: string;
  environmentTitle: string | null;
  totalRequests: number;
}

export class ConsoleReporter {
  constructor(private options: { verbose: boolean; noColor: boolean }) {
    if (options.noColor) {
      chalk.level = 0;
    }
  }

  printHeader(ctx: HeaderContext): void {
    const envLabel = ctx.environmentTitle ?? 'none';
    process.stdout.write(chalk.bold(`Rentgen CLI v${version}`) + '\n');
    process.stdout.write('\n');
    process.stdout.write(
      `${ctx.projectName} › ${ctx.folderName} · env: ${envLabel} (${ctx.totalRequests} requests)\n`,
    );
    process.stdout.write(chalk.dim('─'.repeat(40)) + '\n');
    process.stdout.write('\n');
  }

  printResult(result: RequestResult, index: number, total: number): void {
    const tag = `[${index}/${total}]`;
    process.stdout.write(`${tag} ${result.method} ${result.url}\n`);

    if (result.error) {
      const lines = result.error.split('\n');
      process.stdout.write(`      ${chalk.red('✗')} ${chalk.red(`Network Error: ${lines[0]}`)}\n`);
      for (let i = 1; i < lines.length; i++) {
        process.stdout.write(`        ${chalk.dim(lines[i])}\n`);
      }
    } else if (result.success) {
      process.stdout.write(
        `      ${chalk.green('✓')} ${chalk.green(result.statusText)} ${chalk.dim(`(${result.duration}ms)`)}\n`,
      );
    } else {
      process.stdout.write(
        `      ${chalk.red('✗')} ${chalk.red(result.statusText)} ${chalk.dim(`(${result.duration}ms)`)}\n`,
      );
    }

    if (this.options.verbose && result.verbose) {
      this.printVerboseDetails(result.verbose);
    }

    process.stdout.write('\n');
  }

  printSummary(result: RunResult): void {
    process.stdout.write(chalk.dim('─'.repeat(40)) + '\n');

    const parts = [
      result.passed > 0 ? chalk.green(`${result.passed} passed`) : `${result.passed} passed`,
      result.failed > 0 ? chalk.red(`${result.failed} failed`) : `${result.failed} failed`,
    ];
    if (result.errors > 0) parts.push(chalk.red(`${result.errors} errors`));

    process.stdout.write(`Results: ${parts.join(', ')}\n`);
    process.stdout.write(`Duration: ${this.formatDuration(result.duration)}\n`);

    const failed = result.results.filter((r) => !r.success);
    if (failed.length > 0) {
      process.stdout.write('\n');
      process.stdout.write(chalk.red('Failed:') + '\n');
      for (const r of failed) {
        const idx = result.results.indexOf(r) + 1;
        const total = result.totalRequests;
        const path = this.extractPath(r.url);
        const errorFirstLine = r.error?.split('\n')[0] ?? '';
        const reason = r.error ? `Network Error: ${errorFirstLine}` : r.statusText;
        process.stdout.write(`  [${idx}/${total}] ${r.method} ${path} — ${reason}\n`);
      }
    }
  }

  private printVerboseDetails(verbose: VerboseDetails): void {
    if (verbose.unresolvedVariables.length > 0) {
      process.stdout.write(
        `      ${chalk.yellow('⚠')} ${chalk.yellow(
          `Unresolved variables (substituted as empty string): ${verbose.unresolvedVariables.join(', ')}`,
        )}\n`,
      );
    }

    process.stdout.write(chalk.dim('      Request Headers:') + '\n');
    for (const [key, value] of Object.entries(verbose.requestHeaders)) {
      process.stdout.write(chalk.dim(`        ${key}: ${value}`) + '\n');
    }

    if (verbose.requestBody) {
      process.stdout.write(chalk.dim('      Request Body:') + '\n');
      process.stdout.write(chalk.dim(`        ${this.truncate(verbose.requestBody, 500)}`) + '\n');
    }

    process.stdout.write(chalk.dim('      Response Headers:') + '\n');
    for (const [key, value] of Object.entries(verbose.responseHeaders)) {
      process.stdout.write(chalk.dim(`        ${key}: ${value}`) + '\n');
    }

    process.stdout.write(chalk.dim('      Response Body:') + '\n');
    process.stdout.write(chalk.dim(`        ${this.truncate(verbose.responseBody, 1000)}`) + '\n');

    if (verbose.dynamicVarDetails.length > 0) {
      process.stdout.write(chalk.dim('      Dynamic Variables:') + '\n');
      for (const dv of verbose.dynamicVarDetails) {
        if (dv.extracted) {
          process.stdout.write(
            `        ${chalk.green('✓')} ${chalk.dim(
              `${dv.key} = "${dv.value}" (extracted from ${dv.source}: ${dv.selector})`,
            )}\n`,
          );
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
