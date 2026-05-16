/* eslint-disable @typescript-eslint/no-require-imports */
const path = require('path');
const fs = require('fs');
const { exec } = require('@yao-pkg/pkg');

function detectPlatform() {
  if (process.env.TARGET_PLATFORM) return process.env.TARGET_PLATFORM;
  if (process.platform === 'darwin') return 'macos';
  if (process.platform === 'win32') return 'win';
  return 'linux';
}

function detectArch() {
  return process.env.TARGET_ARCH || process.arch;
}

const platform = detectPlatform();
const arch = detectArch();
const target = `node20-${platform}-${arch}`;

const repoRoot = path.resolve(__dirname, '..');
const entry = path.join(repoRoot, 'dist', 'cli', 'index.js');

if (!fs.existsSync(entry)) {
  console.error(`Missing CLI entry: ${entry}`);
  console.error('Run "npm run build:cli" first.');
  process.exit(1);
}

const outDir = path.join(repoRoot, 'cli-bin');
fs.mkdirSync(outDir, { recursive: true });
const outName = platform === 'win' ? 'rentgen.exe' : 'rentgen';
const outPath = path.join(outDir, outName);

(async () => {
  console.log(`Building CLI binary for ${target}...`);
  await exec([entry, '--target', target, '--output', outPath, '--compress', 'GZip']);

  if (platform !== 'win') fs.chmodSync(outPath, 0o755);

  const size = (fs.statSync(outPath).size / (1024 * 1024)).toFixed(1);
  console.log(`Built ${outPath} (${size} MB) for ${target}`);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
