import cn from 'classnames';
import { useCallback, useEffect, useState } from 'react';
import { useAppDispatch } from '../../store/hooks';
import { uiActions } from '../../store/slices/uiSlice';
import Button, { ButtonType } from '../buttons/Button';

interface CliStatus {
  platform: NodeJS.Platform;
  bundled: { available: boolean; path: string | null };
  pathEntry: { found: boolean; resolvedPath: string | null; pointsToBundled: boolean; version: string | null };
  managedBy: 'package-manager' | 'app' | 'manual' | 'none';
  recommendedTarget: string | null;
  notes: string[];
}

interface CliActionResult {
  success: boolean;
  message: string;
  details?: string;
}

interface FlagRow {
  flag: string;
  desc: string;
}

const flags: FlagRow[] = [
  { flag: '--collection <name>', desc: 'Folder to run from the project file. Omit to pick interactively.' },
  { flag: '--env <name>', desc: 'Environment to use. Pass --env=none to run without any environment.' },
  { flag: '--skip-integrity-check', desc: 'Skip the checksum confirmation prompt.' },
  { flag: '--var <key=value>', desc: 'Override a variable. Repeatable. Highest priority over env and dynamic values.' },
  { flag: '--timeout <ms>', desc: 'Per-request timeout in milliseconds. Default 30000.' },
  { flag: '--fail-fast', desc: 'Stop after the first non-2xx response.' },
  {
    flag: '--report <format>',
    desc: 'Machine-readable output. Supported: json (writes JSON to stdout, suppresses human output).',
  },
  { flag: '--no-color', desc: 'Disable colored output.' },
  { flag: '--verbose', desc: 'Print full request/response details and warn about unresolved variables.' },
];

interface ExitCode {
  code: string;
  meaning: string;
}

const exitCodes: ExitCode[] = [
  { code: '0', meaning: 'All requests passed.' },
  { code: '1', meaning: 'Run completed with failures, aborted at the checksum prompt, or interrupted with Ctrl+C.' },
  {
    code: '2',
    meaning:
      'Invalid input: missing file, bad JSON, wrong shape, ambiguous or unknown --collection / --env, or CI mode without the required flags.',
  },
];

const CodeBlock = ({ children }: { children: string }) => (
  <pre className="m-0 px-3 py-2 text-xs font-mono rounded-md bg-button-secondary dark:bg-dark-input overflow-x-auto whitespace-pre-wrap break-all">
    <code>{children}</code>
  </pre>
);

const SectionHeader = ({ children }: { children: React.ReactNode }) => (
  <h5 className="flex items-center justify-between gap-4 m-0 pb-1.5 border-b border-b-border dark:border-b-dark-border mt-4">
    <span>{children}</span>
  </h5>
);

function platformLabel(p: NodeJS.Platform): string {
  if (p === 'darwin') return 'macOS';
  if (p === 'win32') return 'Windows';
  if (p === 'linux') return 'Linux';
  return p;
}

function StatusBadge({ status }: { status: CliStatus }) {
  if (!status.bundled.available && !status.pathEntry.found) {
    return (
      <div className="flex items-start gap-2">
        <span className="inline-block w-2 h-2 mt-1.5 rounded-full bg-amber-500 shrink-0" />
        <div className="flex flex-col">
          <span className="text-sm font-medium">CLI binary unavailable</span>
          <span className="text-xs text-text-secondary">
            {status.notes[0] ?? 'Reinstall the latest Rentgen build to enable the CLI.'}
          </span>
        </div>
      </div>
    );
  }

  if (status.pathEntry.found && status.pathEntry.pointsToBundled) {
    return (
      <div className="flex items-start gap-2">
        <span className="inline-block w-2 h-2 mt-1.5 rounded-full bg-green-500 shrink-0" />
        <div className="flex flex-col">
          <span className="text-sm font-medium">
            Installed{status.managedBy === 'package-manager' ? ' (managed by package manager)' : ''}
          </span>
          <span className="text-xs text-text-secondary">
            {status.pathEntry.version ? `${status.pathEntry.version} at ` : 'at '}
            <code>{status.pathEntry.resolvedPath}</code>
          </span>
        </div>
      </div>
    );
  }

  if (status.pathEntry.found && !status.pathEntry.pointsToBundled) {
    return (
      <div className="flex items-start gap-2">
        <span className="inline-block w-2 h-2 mt-1.5 rounded-full bg-amber-500 shrink-0" />
        <div className="flex flex-col">
          <span className="text-sm font-medium">Conflicting `rentgen` on PATH</span>
          <span className="text-xs text-text-secondary">
            <code>{status.pathEntry.resolvedPath}</code> is on PATH but doesn't point at this Rentgen install. Remove it
            or installing here will shadow it.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2">
      <span className="inline-block w-2 h-2 mt-1.5 rounded-full bg-text-secondary shrink-0" />
      <div className="flex flex-col">
        <span className="text-sm font-medium">Not installed</span>
        <span className="text-xs text-text-secondary">
          Click <em>Install</em> below to add <code>rentgen</code> to your shell PATH.
        </span>
      </div>
    </div>
  );
}

function ActionRow({
  status,
  busy,
  onInstall,
  onUninstall,
}: {
  status: CliStatus;
  busy: boolean;
  onInstall: () => void;
  onUninstall: () => void;
}) {
  if (!status.bundled.available) return null;

  if (status.managedBy === 'package-manager') {
    return (
      <p className="m-0 text-xs text-text-secondary">
        The Linux package manager handles install and removal. Use <code>sudo apt remove rentgen</code> /{' '}
        <code>sudo dnf remove rentgen</code> to uninstall.
      </p>
    );
  }

  if (status.pathEntry.pointsToBundled) {
    return (
      <div className="flex gap-2">
        <Button buttonType={ButtonType.DANGER} onClick={onUninstall} disabled={busy}>
          {busy ? 'Working…' : 'Uninstall CLI'}
        </Button>
        <Button buttonType={ButtonType.SECONDARY} onClick={onInstall} disabled={busy}>
          {busy ? 'Working…' : 'Reinstall'}
        </Button>
      </div>
    );
  }

  return (
    <Button buttonType={ButtonType.PRIMARY} className="self-start" onClick={onInstall} disabled={busy}>
      {busy ? 'Working…' : 'Install rentgen command in PATH'}
    </Button>
  );
}

function PlatformTip({ platform }: { platform: NodeJS.Platform }) {
  if (platform === 'darwin') {
    return (
      <p className="m-0 text-xs text-text-secondary">
        macOS will prompt for your password to write the symlink to <code>/usr/local/bin/rentgen</code>. After install,
        open a new Terminal tab to pick up the change.
      </p>
    );
  }
  if (platform === 'win32') {
    return (
      <p className="m-0 text-xs text-text-secondary">
        Windows install adds the Rentgen resources directory to your <em>user</em> PATH (no admin needed). Open a new
        PowerShell, Command Prompt, or Windows Terminal tab after install — existing shells won't see the change.
      </p>
    );
  }
  if (platform === 'linux') {
    return (
      <p className="m-0 text-xs text-text-secondary">
        On Linux, the deb/rpm postinstall script links <code>/usr/bin/rentgen</code> automatically. If you installed via
        a portable archive instead, this button creates a user symlink at <code>/usr/local/bin/rentgen</code> (or{' '}
        <code>~/.local/bin/rentgen</code> as a fallback).
      </p>
    );
  }
  return null;
}

function ResultBanner({ result }: { result: CliActionResult }) {
  return (
    <div
      className={cn(
        'flex flex-col gap-1 p-3 rounded-md border text-xs',
        result.success
          ? 'bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-300'
          : 'bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-300',
      )}
    >
      <span>{result.message}</span>
      {result.details && (
        <pre className="m-0 mt-1 px-2 py-1 text-[11px] font-mono rounded bg-black/20 whitespace-pre-wrap break-all">
          <code>{result.details}</code>
        </pre>
      )}
    </div>
  );
}

export function CliSettings() {
  const dispatch = useAppDispatch();
  const [status, setStatus] = useState<CliStatus | null>(null);
  const [busy, setBusy] = useState(false);
  const [lastResult, setLastResult] = useState<CliActionResult | null>(null);

  const handleExportProject = async () => {
    const result = await window.electronAPI.exportProject();
    if (result.success) {
      dispatch(uiActions.setExported(true));
      setTimeout(() => dispatch(uiActions.setExported(false)), 2000);
    }
  };

  const refresh = useCallback(async () => {
    const next = await window.electronAPI.getCliStatus();
    setStatus(next);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleInstall = async () => {
    setBusy(true);
    setLastResult(null);
    try {
      const result = await window.electronAPI.installCli();
      setLastResult(result);
      await refresh();
    } finally {
      setBusy(false);
    }
  };

  const handleUninstall = async () => {
    setBusy(true);
    setLastResult(null);
    try {
      const result = await window.electronAPI.uninstallCli();
      setLastResult(result);
      await refresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="m-0 text-xs text-text-secondary">
        The Rentgen CLI runs a folder of requests from a <code>.rentgen</code> project export, straight from the
        terminal — built for CI pipelines and scripted smoke tests. It reads the same file produced by{' '}
        <em>General → Export Project</em> and never writes back to it.
      </p>

      <SectionHeader>
        <span>Install in shell PATH ({status ? platformLabel(status.platform) : '…'})</span>
      </SectionHeader>

      {status === null ? (
        <p className="m-0 text-xs text-text-secondary">Checking install status…</p>
      ) : (
        <>
          <div className="flex flex-col gap-3 p-3 border border-border dark:border-dark-border rounded-md">
            <StatusBadge status={status} />
            <ActionRow status={status} busy={busy} onInstall={handleInstall} onUninstall={handleUninstall} />
          </div>

          <PlatformTip platform={status.platform} />

          {status.notes.length > 0 && (
            <ul className="m-0 pl-4 text-xs text-text-secondary">
              {status.notes.map((note, i) => (
                <li key={i}>{note}</li>
              ))}
            </ul>
          )}

          {lastResult && <ResultBanner result={lastResult} />}
        </>
      )}

      <SectionHeader>Run the CLI</SectionHeader>
      <p className="m-0 text-xs text-text-secondary">
        Rentgen exposes a single subcommand, <code>xray</code> (alias: <code>run</code>). Point it at a project file you
        exported from the app.
      </p>
      <CodeBlock>rentgen xray &lt;project-file&gt; [options]</CodeBlock>
      <div className="flex items-center gap-3">
        <Button buttonType={ButtonType.PRIMARY} onClick={handleExportProject}>
          Export Project
        </Button>
        <span className="text-xs text-text-secondary">
          Don&apos;t have a project file yet? Export one now — same action as <em>General → Export Project</em>.
        </span>
      </div>
      <p className="m-0 text-xs text-text-secondary">
        During development, invoke directly from the repo with <code>npm run dev:cli -- xray …</code>.
      </p>

      <SectionHeader>Options</SectionHeader>
      <div className="flex flex-col border border-border dark:border-dark-border rounded-md divide-y divide-border dark:divide-dark-border overflow-hidden text-xs">
        {flags.map((f) => (
          <div key={f.flag} className="grid grid-cols-[auto_1fr] items-start gap-4 py-2 px-3">
            <code className="font-mono whitespace-nowrap">{f.flag}</code>
            <span className="text-text-secondary">{f.desc}</span>
          </div>
        ))}
      </div>

      <SectionHeader>Examples</SectionHeader>
      <p className="m-0 text-xs text-text-secondary">Pick a folder and environment interactively:</p>
      <CodeBlock>rentgen xray ./rentgen-project.rentgen</CodeBlock>

      <p className="m-0 text-xs text-text-secondary">
        Scripted CI run with an explicit folder and environment, failing fast:
      </p>
      <CodeBlock>{`rentgen xray ./rentgen-project.rentgen \\
  --collection="Smoke Tests" \\
  --env=staging \\
  --fail-fast \\
  --skip-integrity-check`}</CodeBlock>

      <p className="m-0 text-xs text-text-secondary">
        Machine-readable output for CI pipelines (GitHub Actions, Jenkins, Slack notifiers):
      </p>
      <CodeBlock>{`rentgen xray ./rentgen-project.rentgen \\
  --collection="Smoke Tests" \\
  --env=staging \\
  --fail-fast \\
  --skip-integrity-check \\
  --report=json`}</CodeBlock>

      <p className="m-0 text-xs text-text-secondary">Override variables at the call site (highest priority):</p>
      <CodeBlock>{`rentgen xray ./rentgen-project.rentgen \\
  --collection="Smoke Tests" \\
  --env=none \\
  --var apiKey=abc123 \\
  --var host=https://staging.example.com`}</CodeBlock>

      <SectionHeader>Integrity check</SectionHeader>
      <p className="m-0 text-xs text-text-secondary">
        Every project export carries a SHA-256 checksum of its data. On load, the CLI recomputes the checksum. If it
        matches, the run proceeds silently. If it&apos;s missing or tampered with, you&apos;ll see a confirmation prompt
        in a TTY or an error in CI. <code>--skip-integrity-check</code> bypasses the gate — use it when you know the
        file was hand-edited on purpose.
      </p>

      <SectionHeader>Exit codes</SectionHeader>
      <div className="flex flex-col border border-border dark:border-dark-border rounded-md divide-y divide-border dark:divide-dark-border overflow-hidden text-xs">
        {exitCodes.map((e) => (
          <div key={e.code} className="grid grid-cols-[auto_1fr] items-start gap-4 py-2 px-3">
            <code className="font-mono whitespace-nowrap">{e.code}</code>
            <span className="text-text-secondary">{e.meaning}</span>
          </div>
        ))}
      </div>

      <SectionHeader>Idempotency</SectionHeader>
      <p className="m-0 text-xs text-text-secondary">
        The CLI never writes to the project file. Dynamic variables extracted from responses are kept in memory for the
        duration of a single run, so two back-to-back invocations against an unmodified project produce byte-identical
        resolved URLs, headers, and bodies.
      </p>
    </div>
  );
}
