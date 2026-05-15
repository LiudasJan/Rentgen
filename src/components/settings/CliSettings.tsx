import cn from 'classnames';
import { useCallback, useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
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
  descKey: string;
}

const flags: FlagRow[] = [
  { flag: '--collection <name>', descKey: 'settings.cli.flag.collection' },
  { flag: '--env <name>', descKey: 'settings.cli.flag.env' },
  { flag: '--skip-integrity-check', descKey: 'settings.cli.flag.skipIntegrityCheck' },
  { flag: '--var <key=value>', descKey: 'settings.cli.flag.var' },
  { flag: '--timeout <ms>', descKey: 'settings.cli.flag.timeout' },
  { flag: '--fail-fast', descKey: 'settings.cli.flag.failFast' },
  { flag: '--report <format>', descKey: 'settings.cli.flag.report' },
  { flag: '--no-color', descKey: 'settings.cli.flag.noColor' },
  { flag: '--verbose', descKey: 'settings.cli.flag.verbose' },
];

interface ExitCode {
  code: string;
  meaningKey: string;
}

const exitCodes: ExitCode[] = [
  { code: '0', meaningKey: 'settings.cli.exit.code0' },
  { code: '1', meaningKey: 'settings.cli.exit.code1' },
  { code: '2', meaningKey: 'settings.cli.exit.code2' },
];

const transComponents = { c: <code />, e: <em /> };

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

function usePlatformLabel() {
  const { t } = useTranslation();
  return (p: NodeJS.Platform): string => {
    if (p === 'darwin') return t('settings.cli.platform.macos');
    if (p === 'win32') return t('settings.cli.platform.windows');
    if (p === 'linux') return t('settings.cli.platform.linux');
    return p;
  };
}

function StatusBadge({ status }: { status: CliStatus }) {
  const { t } = useTranslation();

  if (!status.bundled.available && !status.pathEntry.found) {
    return (
      <div className="flex items-start gap-2">
        <span className="inline-block w-2 h-2 mt-1.5 rounded-full bg-amber-500 shrink-0" />
        <div className="flex flex-col">
          <span className="text-sm font-medium">{t('settings.cli.status.binaryUnavailable')}</span>
          <span className="text-xs text-text-secondary">
            {status.notes[0] ?? t('settings.cli.status.binaryUnavailableReinstall')}
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
            {t('settings.cli.status.installed')}
            {status.managedBy === 'package-manager' ? t('settings.cli.status.managedByPackageManager') : ''}
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
          <span className="text-sm font-medium">{t('settings.cli.status.conflictingPath')}</span>
          <span className="text-xs text-text-secondary">
            <Trans
              i18nKey="settings.cli.status.conflictingPathDescription"
              values={{ path: status.pathEntry.resolvedPath ?? '' }}
              components={transComponents}
            />
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2">
      <span className="inline-block w-2 h-2 mt-1.5 rounded-full bg-text-secondary shrink-0" />
      <div className="flex flex-col">
        <span className="text-sm font-medium">{t('settings.cli.status.notInstalled')}</span>
        <span className="text-xs text-text-secondary">
          <Trans i18nKey="settings.cli.status.notInstalledDescription" components={transComponents} />
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
  const { t } = useTranslation();
  if (!status.bundled.available) return null;

  if (status.managedBy === 'package-manager') {
    return (
      <p className="m-0 text-xs text-text-secondary">
        <Trans i18nKey="settings.cli.action.packageManagerNote" components={transComponents} />
      </p>
    );
  }

  if (status.pathEntry.pointsToBundled) {
    return (
      <div className="flex gap-2">
        <Button buttonType={ButtonType.DANGER} onClick={onUninstall} disabled={busy}>
          {busy ? t('settings.cli.action.working') : t('settings.cli.action.uninstall')}
        </Button>
        <Button buttonType={ButtonType.SECONDARY} onClick={onInstall} disabled={busy}>
          {busy ? t('settings.cli.action.working') : t('settings.cli.action.reinstall')}
        </Button>
      </div>
    );
  }

  return (
    <Button buttonType={ButtonType.PRIMARY} className="self-start" onClick={onInstall} disabled={busy}>
      {busy ? t('settings.cli.action.working') : t('settings.cli.action.installRentgenInPath')}
    </Button>
  );
}

function PlatformTip({ platform }: { platform: NodeJS.Platform }) {
  if (platform === 'darwin') {
    return (
      <p className="m-0 text-xs text-text-secondary">
        <Trans i18nKey="settings.cli.platformTip.macos" components={transComponents} />
      </p>
    );
  }
  if (platform === 'win32') {
    return (
      <p className="m-0 text-xs text-text-secondary">
        <Trans i18nKey="settings.cli.platformTip.windows" components={transComponents} />
      </p>
    );
  }
  if (platform === 'linux') {
    return (
      <p className="m-0 text-xs text-text-secondary">
        <Trans i18nKey="settings.cli.platformTip.linux" components={transComponents} />
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
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const platformLabel = usePlatformLabel();
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
        <Trans i18nKey="settings.cli.intro" components={transComponents} />
      </p>
      <p className="m-0 text-xs text-text-secondary">
        {t('settings.cli.fullDocumentation')}{' '}
        <button
          type="button"
          onClick={() => window.electronAPI.openExternal('https://rentgen.io/cli')}
          className="p-0 bg-transparent border-0 underline text-button-primary hover:text-button-primary-hover cursor-pointer"
        >
          rentgen.io/cli
        </button>
      </p>

      <SectionHeader>
        <span>{t('settings.cli.installInPath', { platform: status ? platformLabel(status.platform) : '…' })}</span>
      </SectionHeader>

      {status === null ? (
        <p className="m-0 text-xs text-text-secondary">{t('settings.cli.checkingStatus')}</p>
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

      <SectionHeader>{t('settings.cli.runCli')}</SectionHeader>
      <p className="m-0 text-xs text-text-secondary">
        <Trans i18nKey="settings.cli.runCliDescription" components={transComponents} />
      </p>
      <CodeBlock>rentgen xray &lt;project-file&gt; [options]</CodeBlock>
      <div className="flex items-center gap-3">
        <Button buttonType={ButtonType.PRIMARY} onClick={handleExportProject}>
          {t('settings.cli.exportProject')}
        </Button>
        <span className="text-xs text-text-secondary">
          <Trans i18nKey="settings.cli.noProjectFileYet" components={transComponents} />
        </span>
      </div>
      <p className="m-0 text-xs text-text-secondary">
        <Trans i18nKey="settings.cli.developmentNote" components={transComponents} />
      </p>

      <SectionHeader>{t('settings.cli.options')}</SectionHeader>
      <div className="flex flex-col border border-border dark:border-dark-border rounded-md divide-y divide-border dark:divide-dark-border overflow-hidden text-xs">
        {flags.map((f) => (
          <div key={f.flag} className="grid grid-cols-[auto_1fr] items-start gap-4 py-2 px-3">
            <code className="font-mono whitespace-nowrap">{f.flag}</code>
            <span className="text-text-secondary">{t(f.descKey)}</span>
          </div>
        ))}
      </div>

      <SectionHeader>{t('settings.cli.examples')}</SectionHeader>
      <p className="m-0 text-xs text-text-secondary">{t('settings.cli.exampleInteractive')}</p>
      <CodeBlock>rentgen xray ./rentgen-project.rentgen</CodeBlock>

      <p className="m-0 text-xs text-text-secondary">{t('settings.cli.exampleCi')}</p>
      <CodeBlock>{`rentgen xray ./rentgen-project.rentgen \\
  --collection="Smoke Tests" \\
  --env=staging \\
  --fail-fast \\
  --skip-integrity-check`}</CodeBlock>

      <p className="m-0 text-xs text-text-secondary">{t('settings.cli.exampleCiJson')}</p>
      <CodeBlock>{`rentgen xray ./rentgen-project.rentgen \\
  --collection="Smoke Tests" \\
  --env=staging \\
  --fail-fast \\
  --skip-integrity-check \\
  --report=json`}</CodeBlock>

      <p className="m-0 text-xs text-text-secondary">{t('settings.cli.exampleOverrideVars')}</p>
      <CodeBlock>{`rentgen xray ./rentgen-project.rentgen \\
  --collection="Smoke Tests" \\
  --env=none \\
  --var apiKey=abc123 \\
  --var host=https://staging.example.com`}</CodeBlock>

      <SectionHeader>{t('settings.cli.integrityCheck')}</SectionHeader>
      <p className="m-0 text-xs text-text-secondary">
        <Trans i18nKey="settings.cli.integrityCheckDescription" components={transComponents} />
      </p>

      <SectionHeader>{t('settings.cli.exitCodesTitle')}</SectionHeader>
      <div className="flex flex-col border border-border dark:border-dark-border rounded-md divide-y divide-border dark:divide-dark-border overflow-hidden text-xs">
        {exitCodes.map((e) => (
          <div key={e.code} className="grid grid-cols-[auto_1fr] items-start gap-4 py-2 px-3">
            <code className="font-mono whitespace-nowrap">{e.code}</code>
            <span className="text-text-secondary">{t(e.meaningKey)}</span>
          </div>
        ))}
      </div>

      <SectionHeader>{t('settings.cli.idempotency')}</SectionHeader>
      <p className="m-0 text-xs text-text-secondary">{t('settings.cli.idempotencyDescription')}</p>
    </div>
  );
}
