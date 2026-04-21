interface FlagRow {
  flag: string;
  desc: string;
}

const flags: FlagRow[] = [
  { flag: '--collection <name|id>', desc: 'Folder to run from the project file. Omit to pick interactively.' },
  { flag: '--env <name|id>', desc: 'Environment to use. Pass --env=none to run without any environment.' },
  { flag: '--unsafe', desc: 'Skip the checksum confirmation prompt.' },
  { flag: '--var <key=value>', desc: 'Override a variable. Repeatable. Highest priority over env and dynamic values.' },
  { flag: '--timeout <ms>', desc: 'Per-request timeout in milliseconds. Default 30000.' },
  { flag: '--stop-on-failure', desc: 'Stop after the first non-2xx response.' },
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
  <pre className="m-0 px-3 py-2 text-xs font-mono rounded-md bg-button-secondary dark:bg-dark-input overflow-x-auto">
    <code>{children}</code>
  </pre>
);

const SectionHeader = ({ children }: { children: React.ReactNode }) => (
  <h5 className="flex items-center justify-between gap-4 m-0 pb-1.5 border-b border-b-border dark:border-b-dark-border mt-4">
    <span>{children}</span>
  </h5>
);

export function CliSettings() {
  return (
    <div className="flex flex-col gap-4">
      <p className="m-0 text-xs text-text-secondary">
        The Rentgen CLI runs a folder of requests from a <code>.rentgen</code> project export, straight from the
        terminal — built for CI pipelines and scripted smoke tests. It reads the same file produced by{' '}
        <em>General → Export Project</em> and never writes back to it.
      </p>

      <SectionHeader>Run the CLI</SectionHeader>
      <p className="m-0 text-xs text-text-secondary">
        Rentgen exposes a single subcommand, <code>run</code>. Point it at a project file you exported from the app.
      </p>
      <CodeBlock>rentgen run &lt;project-file&gt; [options]</CodeBlock>
      <p className="m-0 text-xs text-text-secondary">
        During development, invoke directly from the repo with <code>npm run dev:cli -- run …</code>. For a distributed
        build run <code>npm run build:cli</code> and execute <code>./dist/cli/index.js run …</code>.
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
      <CodeBlock>rentgen run ./my-project.rentgen</CodeBlock>

      <p className="m-0 text-xs text-text-secondary">
        Scripted CI run with an explicit folder and environment, failing fast:
      </p>
      <CodeBlock>{`rentgen run ./my-project.rentgen \\
  --collection=folder_1767635724788_hvhovvy \\
  --env=staging \\
  --stop-on-failure \\
  --unsafe`}</CodeBlock>

      <p className="m-0 text-xs text-text-secondary">Override variables at the call site (highest priority):</p>
      <CodeBlock>{`rentgen run ./my-project.rentgen \\
  --collection=Smoke \\
  --env=none \\
  --var apiKey=abc123 \\
  --var host=https://staging.example.com`}</CodeBlock>

      <SectionHeader>Integrity check</SectionHeader>
      <p className="m-0 text-xs text-text-secondary">
        Every project export carries a SHA-256 checksum of its data. On load, the CLI recomputes the checksum. If it
        matches, the run proceeds silently. If it&apos;s missing or tampered with, you&apos;ll see a confirmation prompt
        in a TTY or an error in CI. <code>--unsafe</code> bypasses the gate — use it when you know the file was
        hand-edited on purpose.
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
