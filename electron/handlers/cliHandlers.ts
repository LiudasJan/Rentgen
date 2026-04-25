import { app, ipcMain } from 'electron';
import { exec, execFile } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const execAsync = promisify(exec);
const execFileAsync = promisify(execFile);

const BIN_NAME = process.platform === 'win32' ? 'rentgen.exe' : 'rentgen';

export interface CliStatus {
  platform: NodeJS.Platform;
  bundled: { available: boolean; path: string | null };
  pathEntry: { found: boolean; resolvedPath: string | null; pointsToBundled: boolean; version: string | null };
  managedBy: 'package-manager' | 'app' | 'manual' | 'none';
  recommendedTarget: string | null;
  notes: string[];
}

export interface CliActionResult {
  success: boolean;
  message: string;
  details?: string;
}

function getBundledCliPath(): string | null {
  if (!app.isPackaged) return null;
  const candidate = path.join(process.resourcesPath, BIN_NAME);
  return fs.existsSync(candidate) ? candidate : null;
}

function getRecommendedTarget(): string | null {
  if (process.platform === 'darwin' || process.platform === 'linux') return '/usr/local/bin/rentgen';
  if (process.platform === 'win32') return null;
  return null;
}

async function which(binName: string): Promise<string | null> {
  const cmd = process.platform === 'win32' ? 'where' : 'command -v';
  try {
    const { stdout } = await execAsync(`${cmd} ${binName}`);
    const first = stdout
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean)[0];
    return first || null;
  } catch {
    return null;
  }
}

async function getCliVersion(binPath: string): Promise<string | null> {
  try {
    const { stdout } = await execFileAsync(binPath, ['--version'], { timeout: 5000 });
    return stdout.trim() || null;
  } catch {
    return null;
  }
}

async function buildStatus(): Promise<CliStatus> {
  const bundled = getBundledCliPath();

  // GUI-launched apps on macOS don't inherit the user's PATH (no /usr/local/bin), so a plain
  // `command -v rentgen` lookup misses the symlink we just created. Check the well-known install
  // paths directly first, then fall back to PATH lookup for non-standard manual installs.
  const knownTargets: string[] = [];
  const recommended = getRecommendedTarget();
  if (recommended) knownTargets.push(recommended);
  if (process.platform === 'linux') knownTargets.push('/usr/bin/rentgen');

  let resolved: string | null = null;
  for (const candidate of knownTargets) {
    if (fs.lstatSync(candidate, { throwIfNoEntry: false })) {
      resolved = candidate;
      break;
    }
  }
  if (!resolved) resolved = await which('rentgen');

  let pointsToBundled = false;
  let version: string | null = null;
  if (resolved) {
    try {
      const real = fs.realpathSync(resolved);
      pointsToBundled = bundled !== null && real === fs.realpathSync(bundled);
    } catch {
      pointsToBundled = false;
    }
    version = await getCliVersion(resolved);
  }

  let managedBy: CliStatus['managedBy'] = 'none';
  if (resolved) {
    if (process.platform === 'linux' && resolved.startsWith('/usr/bin/')) managedBy = 'package-manager';
    else if (pointsToBundled) managedBy = 'app';
    else managedBy = 'manual';
  }

  const notes: string[] = [];
  if (!app.isPackaged) {
    notes.push('Running unpackaged (dev mode). Install requires a packaged build (npm run package or installed app).');
  } else if (!bundled) {
    notes.push('Bundled CLI binary not found in this build. Reinstall the app or rebuild with `npm run package`.');
  }

  return {
    platform: process.platform,
    bundled: { available: bundled !== null, path: bundled },
    pathEntry: { found: resolved !== null, resolvedPath: resolved, pointsToBundled, version },
    managedBy,
    recommendedTarget: getRecommendedTarget(),
    notes,
  };
}

async function installMacOs(source: string, target: string): Promise<CliActionResult> {
  // Try without sudo first — works if /usr/local/bin is user-writable (Homebrew prefix on Apple Silicon, etc.).
  try {
    fs.mkdirSync(path.dirname(target), { recursive: true });
    if (fs.existsSync(target) || fs.lstatSync(target, { throwIfNoEntry: false })) fs.unlinkSync(target);
    fs.symlinkSync(source, target);
    return { success: true, message: `Linked ${target} → ${source}` };
  } catch {
    // Fall through to elevated path.
  }

  const escaped = (s: string) => s.replace(/"/g, '\\"');
  const script = `do shell script "mkdir -p ${escaped(path.dirname(target))} && ln -sf '${escaped(source)}' '${escaped(target)}'" with administrator privileges`;
  try {
    await execFileAsync('osascript', ['-e', script]);
    return { success: true, message: `Linked ${target} → ${source} (admin)` };
  } catch {
    return {
      success: false,
      message:
        'Failed to create symlink. The macOS password prompt was cancelled, or you can run this manually in Terminal:',
      details: `sudo ln -sf "${source}" "${target}"`,
    };
  }
}

async function uninstallMacOs(target: string): Promise<CliActionResult> {
  if (!fs.existsSync(target) && !fs.lstatSync(target, { throwIfNoEntry: false })) {
    return { success: true, message: 'No symlink found at the install path. Nothing to remove.' };
  }
  try {
    fs.unlinkSync(target);
    return { success: true, message: `Removed ${target}` };
  } catch {
    // fall through to elevated path
  }

  const script = `do shell script "rm -f '${target.replace(/"/g, '\\"')}'" with administrator privileges`;
  try {
    await execFileAsync('osascript', ['-e', script]);
    return { success: true, message: `Removed ${target} (admin)` };
  } catch {
    return {
      success: false,
      message: 'Failed to remove the symlink. You can run this manually in Terminal:',
      details: `sudo rm -f "${target}"`,
    };
  }
}

async function installWindows(source: string): Promise<CliActionResult> {
  const cliDir = path.dirname(source);
  // PowerShell oneliner: append cliDir to user PATH if not already present.
  const ps = `
    $cliDir = '${cliDir.replace(/'/g, "''")}';
    $current = [Environment]::GetEnvironmentVariable('Path', 'User');
    if ($null -eq $current) { $current = '' }
    $parts = $current -split ';' | Where-Object { $_ -ne '' }
    if ($parts -notcontains $cliDir) {
      $newPath = (($parts + $cliDir) -join ';');
      [Environment]::SetEnvironmentVariable('Path', $newPath, 'User');
      Write-Output 'added';
    } else {
      Write-Output 'already-present';
    }
  `
    .replace(/\s+/g, ' ')
    .trim();

  try {
    const { stdout } = await execFileAsync('powershell.exe', ['-NoProfile', '-Command', ps], { windowsHide: true });
    const result = stdout.trim();
    if (result === 'added') {
      return {
        success: true,
        message: `Added ${cliDir} to your user PATH. Open a new PowerShell or Command Prompt to use \`rentgen\`.`,
      };
    }
    return { success: true, message: `${cliDir} is already on your user PATH. Open a new shell to use \`rentgen\`.` };
  } catch (err) {
    return {
      success: false,
      message: 'Failed to update user PATH via PowerShell.',
      details: err instanceof Error ? err.message : String(err),
    };
  }
}

async function uninstallWindows(source: string): Promise<CliActionResult> {
  const cliDir = path.dirname(source);
  const ps = `
    $cliDir = '${cliDir.replace(/'/g, "''")}';
    $current = [Environment]::GetEnvironmentVariable('Path', 'User');
    if ($null -eq $current) { Write-Output 'not-present'; exit }
    $parts = $current -split ';' | Where-Object { $_ -ne '' -and $_ -ne $cliDir }
    if ($parts.Length -ne ($current -split ';' | Where-Object { $_ -ne '' }).Length) {
      [Environment]::SetEnvironmentVariable('Path', ($parts -join ';'), 'User');
      Write-Output 'removed';
    } else {
      Write-Output 'not-present';
    }
  `
    .replace(/\s+/g, ' ')
    .trim();

  try {
    const { stdout } = await execFileAsync('powershell.exe', ['-NoProfile', '-Command', ps], { windowsHide: true });
    const result = stdout.trim();
    if (result === 'removed')
      return { success: true, message: 'Removed Rentgen from your user PATH. Open a new shell.' };
    return { success: true, message: 'Rentgen was not on your user PATH. Nothing to remove.' };
  } catch (err) {
    return {
      success: false,
      message: 'Failed to update user PATH.',
      details: err instanceof Error ? err.message : String(err),
    };
  }
}

async function installLinux(source: string, target: string): Promise<CliActionResult> {
  // Try a user-writable target first if /usr/local/bin is not writable.
  const dir = path.dirname(target);
  try {
    fs.mkdirSync(dir, { recursive: true });
    if (fs.existsSync(target) || fs.lstatSync(target, { throwIfNoEntry: false })) fs.unlinkSync(target);
    fs.symlinkSync(source, target);
    return { success: true, message: `Linked ${target} → ${source}` };
  } catch {
    // Fall back to ~/.local/bin (always user-writable, usually on PATH)
    const fallback = path.join(os.homedir(), '.local', 'bin', 'rentgen');
    try {
      fs.mkdirSync(path.dirname(fallback), { recursive: true });
      if (fs.existsSync(fallback) || fs.lstatSync(fallback, { throwIfNoEntry: false })) fs.unlinkSync(fallback);
      fs.symlinkSync(source, fallback);
      return {
        success: true,
        message: `Linked ${fallback} → ${source}.`,
        details: `If \`rentgen\` isn't found, add ~/.local/bin to PATH:\n  export PATH="$HOME/.local/bin:$PATH"`,
      };
    } catch {
      return {
        success: false,
        message: 'Could not create symlink without elevated privileges. Run this in a terminal:',
        details: `sudo ln -sf "${source}" "${target}"`,
      };
    }
  }
}

async function uninstallLinux(target: string): Promise<CliActionResult> {
  const candidates = [target, path.join(os.homedir(), '.local', 'bin', 'rentgen')];
  const removed: string[] = [];
  for (const candidate of candidates) {
    try {
      const stat = fs.lstatSync(candidate, { throwIfNoEntry: false });
      if (stat && stat.isSymbolicLink()) {
        fs.unlinkSync(candidate);
        removed.push(candidate);
      }
    } catch {
      // ignore — only remove if it exists and is a symlink
    }
  }
  if (removed.length > 0) return { success: true, message: `Removed: ${removed.join(', ')}` };
  return {
    success: true,
    message:
      'No user-installed symlinks found. Package-manager installs are managed by apt/dnf — use `apt remove rentgen` to uninstall.',
  };
}

export function registerCliHandlers(): void {
  ipcMain.handle('cli-status', () => buildStatus());

  ipcMain.handle('cli-install', async (): Promise<CliActionResult> => {
    const bundled = getBundledCliPath();
    if (!bundled) {
      return {
        success: false,
        message: app.isPackaged
          ? 'Bundled CLI binary not found. Reinstall the latest Rentgen build.'
          : 'CLI install is only available in packaged builds. Run `npm run package` first.',
      };
    }

    const target = getRecommendedTarget();
    if (process.platform === 'darwin') return installMacOs(bundled, target!);
    if (process.platform === 'linux') return installLinux(bundled, target!);
    if (process.platform === 'win32') return installWindows(bundled);
    return { success: false, message: `Unsupported platform: ${process.platform}` };
  });

  ipcMain.handle('cli-uninstall', async (): Promise<CliActionResult> => {
    const bundled = getBundledCliPath();
    const target = getRecommendedTarget();
    if (process.platform === 'darwin') return uninstallMacOs(target!);
    if (process.platform === 'linux') return uninstallLinux(target!);
    if (process.platform === 'win32') {
      // Windows uninstall needs a path even if the bundle isn't readable now.
      const guess = bundled ?? path.join(process.resourcesPath, BIN_NAME);
      return uninstallWindows(guess);
    }
    return { success: false, message: `Unsupported platform: ${process.platform}` };
  });
}
