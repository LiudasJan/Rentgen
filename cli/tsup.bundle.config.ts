import type { Options } from 'tsup';

// Builds a single self-contained CommonJS file for the Docker image.
// Differs from the existing `build:cli` script (used by `pkg`) in that
// runtime dependencies are inlined via `noExternal`, so the resulting
// file runs on a stock `node:22-slim` image with no `node_modules`.
//
// Note: We use `import type` rather than `import { defineConfig }` because
// the project's root tsconfig.json has `"paths": { "*": ["node_modules/*"] }`,
// which causes `bundle-require` (used by tsup to load this config) to walk
// every node_modules import — including tsup's own transitive `chokidar` →
// `fsevents` chain, which trips on `.node` native bindings. Importing only
// the type avoids the runtime traversal entirely.
const config: Options = {
  entry: ['cli/index.ts'],
  format: 'cjs',
  target: 'node22',
  outDir: 'dist/cli-bundle',
  noExternal: ['axios', 'commander', 'chalk', '@inquirer/prompts'],
  clean: true,
  splitting: false,
  shims: false,
  sourcemap: false,
};

export default config;
