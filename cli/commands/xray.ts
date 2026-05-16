import { confirm } from '@inquirer/prompts';
import { loadProject } from '../config/projectLoader';
import {
  VariableStore,
  parseVarOverrides,
  filterDynamicVarsForFolder,
} from '../config/variables';
import { resolveSelection } from '../config/selection';
import { SequentialRunner } from '../runner/runner';
import { ConsoleReporter, type HeaderContext } from '../reporter/console';
import { JsonReporter } from '../reporter/json';
import type { IntegrityStatus } from '../../shared/types/project';

export interface XrayOptions {
  collection?: string;
  env?: string;
  skipIntegrityCheck?: boolean;
  var?: string[];
  timeout: string;
  failFast?: boolean;
  color: boolean;
  verbose?: boolean;
  report?: string;
}

type Reporter = ConsoleReporter | JsonReporter;

export async function xrayCommand(projectFile: string, options: XrayOptions): Promise<void> {
  const reportFormat = validateReport(options.report);
  const jsonMode = reportFormat === 'json';

  const { file, integrity, filePath } = loadProject(projectFile);

  await enforceIntegrity(integrity, options.skipIntegrityCheck ?? false, options.verbose ?? false, jsonMode);

  const selection = await resolveSelection(file.data.collection, file.data.environments, {
    collectionArg: options.collection,
    envArg: options.env,
  });

  const filteredDvars = filterDynamicVarsForFolder(file.data.dynamicVariables, selection.folder.id);
  const cliOverrides = parseVarOverrides(options.var ?? []);

  const store = new VariableStore(selection.environment, filteredDvars, cliOverrides);

  const header: HeaderContext = {
    projectName: file.data.collection.info.name,
    folderName: selection.folder.name,
    environmentTitle: selection.environment?.title ?? null,
    totalRequests: selection.folder.item.length,
  };

  const reporter: Reporter = jsonMode
    ? new JsonReporter(header)
    : new ConsoleReporter({ verbose: options.verbose ?? false, noColor: !options.color });

  if (reporter instanceof ConsoleReporter) {
    reporter.printHeader(header);
  }

  const runner = new SequentialRunner(
    selection.folder,
    selection.environment,
    {
      failFast: options.failFast ?? false,
      timeout: parseInt(options.timeout, 10),
      verbose: options.verbose ?? false,
    },
    store,
  );

  if (reporter instanceof ConsoleReporter) {
    runner.onResult((result, index, total) => reporter.printResult(result, index, total));
  }

  process.on('SIGINT', () => {
    if (reporter instanceof ConsoleReporter) {
      process.stdout.write('\n');
    }
    runner.abort();
    reporter.printSummary(runner.getPartialSummary());
    process.exit(1);
  });

  const result = await runner.run();
  reporter.printSummary(result);

  void filePath;

  process.exit(result.success ? 0 : 1);
}

function validateReport(value: string | undefined): 'json' | null {
  if (value === undefined) return null;
  if (value === 'json') return 'json';
  console.error(`Unsupported --report value '${value}'. Supported formats: json`);
  process.exit(2);
}

async function enforceIntegrity(
  status: IntegrityStatus,
  skipIntegrityCheck: boolean,
  verbose: boolean,
  jsonMode: boolean,
): Promise<void> {
  if (skipIntegrityCheck) return;

  if (status === 'verified') {
    if (verbose && !jsonMode) process.stdout.write('Checksum verified.\n');
    return;
  }

  const messages: Record<Exclude<IntegrityStatus, 'verified'>, { prompt: string; ciError: string }> = {
    missing: {
      prompt:
        'No checksum in this project file — it may have been created manually or modified outside Rentgen. Continue?',
      ciError: 'Checksum missing. Pass --skip-integrity-check to proceed.',
    },
    modified: {
      prompt:
        'Checksum mismatch — this project file has been modified since it was exported. Continue?',
      ciError: 'Checksum mismatch. Pass --skip-integrity-check to proceed.',
    },
  };

  const copy = messages[status];

  if (!process.stdin.isTTY || jsonMode) {
    console.error(copy.ciError);
    process.exit(2);
  }

  const proceed = await confirm({ message: copy.prompt, default: false });
  if (!proceed) {
    console.error('Aborted by user.');
    process.exit(1);
  }
}
