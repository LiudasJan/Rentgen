import { readdirSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import chalk from 'chalk';

const LOCALES_DIR = resolve(process.cwd(), 'src', 'i18n', 'locales');
const SOURCE_OF_TRUTH = 'en.ts';

type Plain = Record<string, unknown>;

function isPlainObject(v: unknown): v is Plain {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function collectLeafPaths(
  obj: Plain,
  prefix = '',
  out: Set<string> = new Set(),
): Set<string> {
  for (const [k, v] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${k}` : k;
    if (isPlainObject(v)) {
      collectLeafPaths(v, path, out);
    } else {
      out.add(path);
    }
  }
  return out;
}

async function loadLocaleDefault(file: string): Promise<Plain> {
  const mod = await import(pathToFileURL(file).href);
  const def = mod.default;
  if (!isPlainObject(def)) {
    throw new Error('default export is not a plain object');
  }
  return def;
}

async function main(): Promise<number> {
  if (!existsSync(LOCALES_DIR)) {
    console.error(chalk.red(`Locales directory not found: ${LOCALES_DIR}`));
    return 1;
  }

  const files = readdirSync(LOCALES_DIR).filter((f) => f.endsWith('.ts'));
  if (files.length === 0) {
    console.error(chalk.red(`No .ts locale files found in ${LOCALES_DIR}`));
    return 1;
  }

  const srcPath = join(LOCALES_DIR, SOURCE_OF_TRUTH);
  if (!existsSync(srcPath)) {
    console.error(
      chalk.red(`Source-of-truth ${SOURCE_OF_TRUTH} not found at ${srcPath}`),
    );
    return 1;
  }

  let sourceObj: Plain;
  try {
    sourceObj = await loadLocaleDefault(srcPath);
  } catch (e) {
    console.error(
      chalk.red(`Failed to load ${SOURCE_OF_TRUTH}: ${(e as Error).message}`),
    );
    return 1;
  }
  const sourceSet = collectLeafPaths(sourceObj);

  const others = files.filter((f) => f !== SOURCE_OF_TRUTH).sort();
  console.log(
    chalk.bold(
      `Checking i18n key consistency vs ${SOURCE_OF_TRUTH} (${others.length} other locales, ${sourceSet.size} keys)...`,
    ),
  );

  let failed = 0;
  for (const f of others) {
    const fp = join(LOCALES_DIR, f);
    let obj: Plain;
    try {
      obj = await loadLocaleDefault(fp);
    } catch (e) {
      console.log(
        `  ${chalk.red('✗')} ${f} ${chalk.red(`(load error: ${(e as Error).message})`)}`,
      );
      failed++;
      continue;
    }
    const set = collectLeafPaths(obj);
    const missing = [...sourceSet].filter((p) => !set.has(p)).sort();
    const extra = [...set].filter((p) => !sourceSet.has(p)).sort();

    if (missing.length === 0 && extra.length === 0) {
      console.log(`  ${chalk.green('✓')} ${f}`);
      continue;
    }

    failed++;
    const parts: string[] = [];
    if (missing.length) parts.push(`${missing.length} missing`);
    if (extra.length) parts.push(`${extra.length} extra`);
    console.log(
      `  ${chalk.red('✗')} ${f} ${chalk.dim(`(${parts.join(', ')})`)}`,
    );
    for (const p of missing) {
      console.log(`      ${chalk.red('- missing:')} ${p}`);
    }
    for (const p of extra) {
      console.log(`      ${chalk.yellow('+ extra:  ')} ${p}`);
    }
  }

  console.log();
  if (failed > 0) {
    console.log(
      chalk.red(
        `i18n check FAILED: ${failed} file(s) out of sync with ${SOURCE_OF_TRUTH}.`,
      ),
    );
    return 1;
  }
  console.log(chalk.green('i18n check passed.'));
  return 0;
}

main()
  .then((code) => process.exit(code))
  .catch((e) => {
    console.error(chalk.red('Unexpected error:'), e);
    process.exit(1);
  });
