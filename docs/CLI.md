# Rentgen CLI

Run a folder of requests from a `.rentgen` project export, straight from the terminal — no Rentgen window required after the initial install. Built for CI pipelines and scripted smoke tests.

The CLI ships **inside the desktop app**: install Rentgen once, click a button in Settings, and `rentgen` is on your PATH. Same binary, same version, every release.

---

## Install

### 1. Install the Rentgen desktop app

Download the latest installer for your platform from [Rentgen Releases](https://github.com/Rentgen-io/Rentgen/releases/latest):

| Platform | File |
|---|---|
| macOS (Apple Silicon) | `Rentgen-<version>-mac-arm64.dmg` |
| macOS (Intel) | `Rentgen-<version>-mac-x64.dmg` |
| Windows (x64) | `Rentgen-<version>-win-x64.exe` |
| Windows (ARM64) | `Rentgen-<version>-win-arm64.exe` |
| Debian / Ubuntu | `Rentgen-<version>-linux-x64.deb` or `linux-arm64.deb` |
| Fedora / RHEL | `Rentgen-<version>-linux-x64.rpm` or `linux-arm64.rpm` |

Install it the normal way:
- **macOS**: open the `.dmg` and drag Rentgen to Applications
- **Windows**: run the `.exe`
- **Linux (deb)**: `sudo apt install ./Rentgen-<version>-linux-x64.deb`
- **Linux (rpm)**: `sudo dnf install ./Rentgen-<version>-linux-x64.rpm`

### 2. Enable the `rentgen` command in your shell

#### Linux — automatic

The Linux package post-install hook creates `/usr/bin/rentgen` for you. Open a terminal:

```sh
rentgen --version
```

If it works, you're done. Skip to [First run](#first-run).

#### macOS — one click in Settings

1. Open **Rentgen**.
2. Click the gear icon (or press **⌘,**) to open **Settings**.
3. Go to the **CLI** tab.
4. Click **Install rentgen command in PATH**.
5. macOS will prompt for your password — this is needed to write the symlink to `/usr/local/bin/rentgen`.
6. Open a **new** Terminal tab and run `rentgen --version`.

#### Windows — one click in Settings

1. Open **Rentgen**.
2. Click the gear icon to open **Settings**.
3. Go to the **CLI** tab.
4. Click **Install rentgen command in PATH**.
5. The button adds Rentgen's resources directory to your **user** PATH (no admin needed).
6. Close every PowerShell, Command Prompt, and Windows Terminal tab, then open a fresh one and run `rentgen --version`.

> Existing shells **won't** see the PATH change — that's a Windows quirk, not a Rentgen bug.

---

## First run

Export a project from the desktop app (**General → Export Project**), then point the CLI at the file:

```sh
rentgen xray ./rentgen-project.rentgen
```

The CLI will let you pick a folder and environment interactively. Pick one, hit enter, and watch the requests fly.

For CI / scripted runs, pass everything explicitly:

```sh
rentgen xray ./rentgen-project.rentgen \
  --collection="Smoke Tests" \
  --env=staging \
  --fail-fast \
  --skip-integrity-check
```

See `rentgen xray --help` for the full flag list, or check the **Settings → CLI** panel inside Rentgen for the same reference with examples.

> `rentgen run` is accepted as an alias for `rentgen xray` — use whichever reads better in your scripts.

---

## Run from Docker

For CI/CD pipelines you don't have to install the desktop app at all. The CLI ships as a public Docker image:

```sh
docker pull ghcr.io/rentgen-io/rentgen-cli:latest
```

Tags published per release:

| Tag | Meaning |
|---|---|
| `:1.20.0` | Exact version. **Recommended for CI** — fully reproducible. |
| `:1.20` | Latest patch in the 1.20 minor line. Picks up bug fixes automatically. |
| `:latest` | Newest published release. Convenient, but a major release will change behavior without warning. |

Both `linux/amd64` and `linux/arm64` are published — Docker pulls the right one automatically.

### Local one-off

```sh
docker run --rm -v "$PWD":/work \
  ghcr.io/rentgen-io/rentgen-cli:1.20.0 \
  xray ./project.rentgen --collection="Smoke Tests" --env=staging --skip-integrity-check
```

`--skip-integrity-check` is required when running headless: there's no TTY for the checksum confirmation prompt, and without `--skip-integrity-check` the CLI exits with code 2.

### GitHub Actions

```yaml
jobs:
  rentgen-api-check:
    runs-on: ubuntu-latest
    container:
      image: ghcr.io/rentgen-io/rentgen-cli:1.20.0
    steps:
      - uses: actions/checkout@v5
      - run: rentgen xray ./project.rentgen --collection="Smoke Tests" --env=staging --skip-integrity-check
```

### GitLab CI

```yaml
rentgen-api-check:
  image: ghcr.io/rentgen-io/rentgen-cli:1.20.0
  stage: test
  script:
    - rentgen xray ./project.rentgen --collection="Smoke Tests" --env=staging --skip-integrity-check
```

### Bitbucket Pipelines

```yaml
pipelines:
  default:
    - step:
        name: Rentgen API check
        image: ghcr.io/rentgen-io/rentgen-cli:1.20.0
        script:
          - rentgen xray ./project.rentgen --collection="Smoke Tests" --env=staging --skip-integrity-check
```

### Jenkins (Declarative pipeline)

```groovy
pipeline {
  agent {
    docker {
      image 'ghcr.io/rentgen-io/rentgen-cli:1.20.0'
      args '-v $WORKSPACE:/work -w /work'
    }
  }
  stages {
    stage('Rentgen API check') {
      steps {
        sh 'rentgen xray ./project.rentgen --collection="Smoke Tests" --env=staging --skip-integrity-check'
      }
    }
  }
}
```

### Notes

- The image is **public** — no `docker login` required.
- The container runs as `root` by default. To run as a non-root user, build your own image: `FROM ghcr.io/rentgen-io/rentgen-cli:1.20.0` then `USER 1001`.
- Exit codes are unchanged from the native CLI: `0` (all pass), `1` (failures or interrupted), `2` (invalid input or missing CI flags).

---

## Update

Updating is the same as updating the desktop app: download the latest `.dmg` / `.exe` / `.deb` / `.rpm`, install over the top, and the bundled CLI is replaced too. The PATH symlink keeps pointing at the new binary — no second click needed unless you uninstalled.

> **Linux**: `apt upgrade rentgen` or `dnf upgrade rentgen` reinstalls the symlink automatically.

---

## Uninstall

### Just the CLI (keep the desktop app)

Open **Settings → CLI** and click **Uninstall CLI**. This removes the symlink (macOS / Linux) or the PATH entry (Windows) — the desktop app stays installed.

### Everything (CLI + desktop app)

- **macOS**: drag `Rentgen.app` to Trash. The CLI symlink will become a broken link — remove it with `sudo rm /usr/local/bin/rentgen`.
- **Windows**: uninstall Rentgen from *Add or Remove Programs*. Optionally remove the resources directory from your user PATH (Settings → CLI → Uninstall, before removing the app).
- **Debian / Ubuntu**: `sudo apt remove rentgen` — removes the app and the `/usr/bin/rentgen` symlink.
- **Fedora / RHEL**: `sudo dnf remove rentgen` — same.

---

## Troubleshooting

### `command not found: rentgen`

- Did you open a **new** terminal after clicking Install? PATH changes don't apply to already-open shells.
- macOS: confirm `/usr/local/bin` is on your PATH — `echo $PATH | tr ':' '\n' | grep local`. Add `export PATH="/usr/local/bin:$PATH"` to your shell profile if missing.
- Linux: confirm `/usr/bin/rentgen` exists — `ls -l /usr/bin/rentgen`. If you installed via a portable archive (no postinst), use the **Install** button in Settings to create the symlink.
- Windows: in a fresh PowerShell, `[Environment]::GetEnvironmentVariable('Path', 'User')` should contain the Rentgen resources path.

### `rentgen` runs but it's a different program

Another tool may already provide a `rentgen` binary on your PATH. The Settings panel shows a yellow warning when this happens. Either:
- Uninstall the conflicting tool, or
- Reorder PATH so Rentgen's directory comes first, or
- Rename our symlink (e.g., `rentgen-cli`) by editing it manually.

### macOS: "rentgen can't be opened because it is from an unidentified developer"

Shouldn't happen on official releases — the binary is signed with our Developer ID and notarized as part of the app bundle. If you see this, you probably installed from an unsigned local build (`npm run package`). For local builds: `xattr -d com.apple.quarantine /usr/local/bin/rentgen`.

### Windows: SmartScreen warning on first run

On first run from a fresh install, Windows may show a SmartScreen prompt. Click **More info → Run anyway**. After Rentgen has been launched once, the warning should not appear again.

### Linux: glibc / libstdc++ errors

The bundled binary uses the same Node 18 runtime that pkg ships. If your distro is older than glibc 2.28 (Debian 10, CentOS 7), the binary won't run. Workarounds:
- Upgrade your distro, or
- Build the CLI from source: `git clone … && npm ci && npm run build:cli && node ./dist/cli/index.js run …`

### "Bundled CLI binary not found in this build"

You're running an unpackaged dev build (or the binary failed to bundle). Either run `npm run package` to produce a real installer, or install the latest official release and use that.

---

## Reference

| Flag | Description |
|---|---|
| `--collection <name>` | Folder to run from the project file. Omit to pick interactively. |
| `--env <name>` | Environment to use. Pass `--env=none` to run without any environment. |
| `--skip-integrity-check` | Skip the checksum confirmation prompt. |
| `--var <key=value>` | Override a variable. Repeatable. Highest priority over env and dynamic values. |
| `--timeout <ms>` | Per-request timeout in milliseconds. Default 30000. |
| `--fail-fast` | Stop after the first non-2xx response. |
| `--report <format>` | Machine-readable output. Supported: `json` (writes JSON to stdout, suppresses human output). |
| `--no-color` | Disable colored output. |
| `--verbose` | Print full request/response details and warn about unresolved variables. |

| Exit code | Meaning |
|---|---|
| `0` | All requests passed. |
| `1` | Run completed with failures, aborted at the checksum prompt, or interrupted with Ctrl+C. |
| `2` | Invalid input: missing file, bad JSON, wrong shape, ambiguous or unknown `--collection` / `--env`, or CI mode without the required flags. |

The CLI never writes to the project file. Dynamic variables extracted from responses are kept in memory for the duration of a single run, so two back-to-back invocations against an unmodified project produce byte-identical resolved URLs, headers, and bodies.
