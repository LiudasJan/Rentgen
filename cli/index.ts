#!/usr/bin/env node
import { Command } from 'commander';
import { runCommand } from './commands/run';

const program = new Command();

program
  .name('rentgen')
  .description('Rentgen CLI — run a folder of requests from a .rentgen project export')
  .version('1.0.0');

program
  .command('run')
  .description('Execute a folder of requests from a .rentgen project export')
  .argument('<project-file>', 'Path to a .rentgen / .json project export')
  .option('--collection <name|id>', 'Folder to run (from data.collection.item[])')
  .option('--env <name|id>', 'Environment to use. --env=none runs with no environment.')
  .option('--unsafe', 'Skip checksum confirmation prompt')
  .option('--var <key=value...>', 'Override variables (repeatable, highest priority)')
  .option('--timeout <ms>', 'Per-request timeout in ms', '30000')
  .option('--stop-on-failure', 'Stop after first failed request')
  .option('--no-color', 'Disable colored output')
  .option('--verbose', 'Show full request/response details + unresolved-var warnings')
  .action(runCommand);

program.parse();
