#!/usr/bin/env node
import { Command } from 'commander';
import { runCommand } from './commands/run';

const program = new Command();

program
  .name('rentgen')
  .description('Rentgen CLI — Run exported collection bundles from the terminal')
  .version('1.0.0');

program
  .command('run')
  .description('Execute requests from an exported bundle file')
  .argument('[bundle]', 'Path to rentgen.bundle.json', './rentgen.bundle.json')
  .option('--var <key=value...>', 'Override variables (repeatable)')
  .option('--timeout <ms>', 'Per-request timeout in ms', '30000')
  .option('--stop-on-failure', 'Stop after first failed request')
  .option('--no-color', 'Disable colored output')
  .option('--verbose', 'Show full request/response details')
  .action(runCommand);

program.parse();
