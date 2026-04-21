import { confirm } from '@inquirer/prompts';
import { loadProject } from '../config/projectLoader';
import {
  VariableStore,
  parseVarOverrides,
  filterDynamicVarsForFolder,
} from '../config/variables';
import { resolveSelection } from '../config/selection';
import { SequentialRunner } from '../runner/runner';
import { ConsoleReporter } from '../reporter/console';
import type { IntegrityStatus } from '../../shared/types/project';

export interface RunOptions {
  collection?: string;
  env?: string;
  unsafe?: boolean;
  var?: string[];
  timeout: string;
  stopOnFailure?: boolean;
  color: boolean;
  verbose?: boolean;
}

export async function runCommand(projectFile: string, options: RunOptions): Promise<void> {
  const { file, integrity, filePath } = loadProject(projectFile);

  await enforceIntegrity(integrity, options.unsafe ?? false, options.verbose ?? false);

  const selection = await resolveSelection(file.data.collection, file.data.environments, {
    collectionArg: options.collection,
    envArg: options.env,
  });

  const filteredDvars = filterDynamicVarsForFolder(file.data.dynamicVariables, selection.folder.id);
  const cliOverrides = parseVarOverrides(options.var ?? []);

  const store = new VariableStore(selection.environment, filteredDvars, cliOverrides);

  const reporter = new ConsoleReporter({
    verbose: options.verbose ?? false,
    noColor: !options.color,
  });

  reporter.printHeader({
    projectName: file.data.collection.info.name,
    folderName: selection.folder.name,
    environmentTitle: selection.environment?.title ?? null,
    totalRequests: selection.folder.item.length,
  });

  const runner = new SequentialRunner(
    selection.folder,
    selection.environment,
    {
      stopOnFailure: options.stopOnFailure ?? false,
      timeout: parseInt(options.timeout, 10),
      verbose: options.verbose ?? false,
    },
    store,
  );

  runner.onResult((result, index, total) => reporter.printResult(result, index, total));

  process.on('SIGINT', () => {
    process.stdout.write('\n');
    runner.abort();
    reporter.printSummary(runner.getPartialSummary());
    process.exit(1);
  });

  const result = await runner.run();
  reporter.printSummary(result);

  void filePath;

  process.exit(result.success ? 0 : 1);
}

async function enforceIntegrity(
  status: IntegrityStatus,
  unsafe: boolean,
  verbose: boolean,
): Promise<void> {
  if (unsafe) return;

  if (status === 'verified') {
    if (verbose) process.stdout.write('Checksum verified.\n');
    return;
  }

  const messages: Record<Exclude<IntegrityStatus, 'verified'>, { prompt: string; ciError: string }> = {
    missing: {
      prompt:
        'No checksum in this project file — it may have been created manually or modified outside Rentgen. Continue?',
      ciError: 'Checksum missing. Pass --unsafe to proceed.',
    },
    modified: {
      prompt:
        'Checksum mismatch — this project file has been modified since it was exported. Continue?',
      ciError: 'Checksum mismatch. Pass --unsafe to proceed.',
    },
  };

  const copy = messages[status];

  if (!process.stdin.isTTY) {
    console.error(copy.ciError);
    process.exit(2);
  }

  const proceed = await confirm({ message: copy.prompt, default: false });
  if (!proceed) {
    console.error('Aborted by user.');
    process.exit(1);
  }
}
