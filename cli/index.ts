#!/usr/bin/env node
import { Command } from 'commander';
import { inspectCommand } from './commands/inspect';
import { version } from '../package.json';

const program = new Command();

program
  .name('rentgen')
  .description('Rentgen CLI — inspect a folder of requests from a .rentgen project export')
  .version(version);

program
  .command('inspect')
  .description('Send a folder of requests from a .rentgen project export and report the responses')
  .argument('<project-file>', 'Path to a .rentgen / .json project export')
  .option('--collection <name>', 'Folder to run (from data.collection.item[])')
  .option('--env <name>', 'Environment to use. --env=none runs with no environment.')
  .option('--skip-integrity-check', 'Skip checksum confirmation prompt')
  .option('--var <key=value...>', 'Override variables (repeatable, highest priority)')
  .option('--timeout <ms>', 'Per-request timeout in ms', '30000')
  .option('--fail-fast', 'Stop after first failed request')
  .option('--report <format>', 'Output format. Supported: json (machine-readable, suppresses human output).')
  .option('--no-color', 'Disable colored output')
  .option('--verbose', 'Show full request/response details + unresolved-var warnings')
  .action(inspectCommand);

program.parse();
