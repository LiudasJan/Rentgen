import { loadBundle } from '../config/loader';
import { VariableStore, parseVarOverrides } from '../config/variables';
import { SequentialRunner } from '../runner/runner';
import { ConsoleReporter } from '../reporter/console';

interface RunOptions {
  var?: string[];
  timeout: string;
  stopOnFailure?: boolean;
  color: boolean;
  verbose?: boolean;
}

export async function runCommand(bundlePath: string, options: RunOptions): Promise<void> {
  const bundle = loadBundle(bundlePath);

  const cliOverrides = parseVarOverrides(options.var ?? []);
  const store = new VariableStore(bundle.variables, bundle.dynamicVariables, cliOverrides);

  const reporter = new ConsoleReporter({
    verbose: options.verbose ?? false,
    noColor: !options.color,
  });

  reporter.printHeader(bundle);

  // Handle empty requests array
  if (bundle.requests.length === 0) {
    process.stdout.write('No requests to execute.\n');
    process.exit(0);
  }

  const runner = new SequentialRunner(bundle, {
    stopOnFailure: options.stopOnFailure ?? false,
    timeout: parseInt(options.timeout, 10),
    verbose: options.verbose ?? false,
  }, store);

  runner.onResult((result, index, total) => {
    reporter.printResult(result, index, total);
  });

  // Graceful Ctrl+C — print partial summary and exit
  process.on('SIGINT', () => {
    process.stdout.write('\n');
    runner.abort();
    const partial = runner.getPartialSummary();
    reporter.printSummary(partial);
    process.exit(1);
  });

  const result = await runner.run();

  reporter.printSummary(result);

  process.exit(result.success ? 0 : 1);
}
