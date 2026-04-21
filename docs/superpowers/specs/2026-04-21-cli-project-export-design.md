# CLI — Consume Project Export Instead of CI Bundle

**Status:** Approved design, pending implementation plan
**Date:** 2026-04-21
**Branch:** `POC/idea-of-cli`

## Problem

The POC CLI added in commit `a89d98e` introduced a second, CLI-specific export format (`rentgen.bundle.json`) produced by a per-folder "Export CI Bundle" button. That format duplicates the existing project export (`.rentgen`, produced by `handleExportProject`) while giving up information the CLI could use — multiple environments, the full folder tree, and the integrity checksum.

We want a single source-of-truth export. The CLI should consume the existing project-export file and let the user pick which folder and environment to run at invocation time.

## Goals

- Remove the CI-bundle export path entirely (UI button, IPC handler, util, types, example file).
- Make the CLI load a `.rentgen` project export and run one selected folder under one selected environment.
- Support both scripted (flag-driven) and interactive (arrow-key prompt) selection.
- Guard against tampering/drift via the existing checksum, with an explicit opt-out for CI.
- Guarantee idempotent runs: dynamic-variable extractions never mutate the project file on disk.

## Non-goals

- Running more than one folder per invocation.
- Nested folder support (project schema is folder → request, one level).
- Rewriting the HTTP client or the dynamic-variable extractor logic.
- Migrating old `rentgen.bundle.json` files — they are deleted, not converted.

## Command surface

```
rentgen run <project-file> [options]

Positional:
  <project-file>            Path to a .rentgen / .json project export

Selection (interactive prompt if omitted):
  --collection <name|id>    Folder to run (from data.collection.item[])
  --env <name|id>           Environment to use (from data.environments[])
                            Use --env=none to explicitly run with no environment.

Integrity:
  --unsafe                  Skip checksum confirmation prompt

Retained from current CLI:
  --var <key=value>         Override variables (repeatable, highest priority)
  --timeout <ms>            Per-request timeout (default 30000)
  --stop-on-failure         Stop after first non-2xx response
  --no-color                Disable colored output
  --verbose                 Full request/response details + unresolved-var warnings
```

### Selection resolution

- `--collection` / `--env` accept either the stored `id` or the human-readable `name`/`title`.
- If a name matches multiple entries (the sample project has 50+ identical env titles, and two folders named "All Requests"), the CLI errors out with the list of matching IDs and exits with code 2. The user re-runs with an unambiguous ID.
- If `--collection` is omitted, the CLI shows an interactive arrow-key list of folders (`@inquirer/prompts` `select`). Each row renders `name` with a secondary line showing the ID and request count.
- After a folder is chosen (via prompt or flag), if `--env` is also omitted and the project has ≥1 environment, the CLI shows an interactive env list. The first option is always `— No environment —`. When the project has zero environments, the env prompt is skipped entirely.
- `--env=none` is the scripted equivalent of picking `— No environment —`. The literal string `none` is reserved at the flag level: if a project happens to contain an environment titled "none" (case-insensitive), users must pass it by ID.
- Non-TTY stdin + missing selection flag → error with "CI mode detected — pass --collection and --env explicitly" and exit code 2.

## Integrity check

On load, the CLI recomputes the checksum using the **same canonicalization** as `electron/handlers/projectHandlers.ts` (alphabetical key sort on objects, then SHA-256 of the canonical string, prefixed with `sha256:`). Byte-for-byte compatibility with desktop exports is required — the shared helper is moved to `shared/checksum.ts` and used by both the main process and the CLI.

| State | TTY behavior | Non-TTY behavior |
|---|---|---|
| Checksum matches | Silent (log only under `--verbose`) | Silent |
| Checksum missing | Prompt: "No checksum in this project file — it may have been created manually or modified outside Rentgen. Continue? (y/N)" | Error, exit 2, message suggests `--unsafe` |
| Checksum mismatch | Prompt: "Checksum mismatch — this project file has been modified since it was exported. Continue? (y/N)" | Error, exit 2, message suggests `--unsafe` |
| Any of the above + `--unsafe` | No prompt, continue | No error, continue |

## Idempotency guarantee

Dynamic variables are extracted during a run and fed into later requests via an in-memory `VariableStore`. The project file is **never written back**. Two consecutive runs of the same command against an unmodified project file produce byte-identical resolved URLs, headers, and bodies for every request.

Initial values for dynamic variables come from `DynamicVariable.currentValue` as it exists in the file at load time. `--var key=value` overrides always win over both static and dynamic sources.

## Unresolved variables

`substituteWithVariables` replaces missing `{{var}}` tokens with an empty string (matching desktop behavior). Under `--verbose`, the CLI logs a yellow warning per request listing the unresolved variable names so the user can spot silent-empty substitutions.

## Removed surface

Deleted outright:

- `src/utils/ciBundle.ts`
- `shared/types/bundle.ts`
- `rentgen.bundle.json` (repo-root example)
- `export-ci-bundle` IPC handler in `electron/handlers/importExportHandlers.ts`
- `exportCIBundle` method + type in `electron/preload.ts`
- The "Export CI Bundle" button, its `handleExportBundle` callback, and the unused imports in `src/components/sidebar/colletion/CollectionGroup.tsx`

Confirmed via exploration: `src/utils/ciBundle.ts` has no other consumers in the renderer, so no downstream breakage.

## New/changed CLI modules

| File | Role |
|---|---|
| `cli/config/projectLoader.ts` (new) | Read file, parse JSON, validate shape via `validateProjectFile` logic, run checksum check, produce typed `ProjectFile`. |
| `cli/config/selection.ts` (new) | Resolve `--collection` / `--env` flags or drive `@inquirer/prompts` fallback. Returns `{ folder: PostmanFolder, environment: Environment \| null }`. |
| `cli/config/variables.ts` (rewritten) | Build `VariableStore` from `environment.variables` + dynamic vars filtered to `collectionId === folder.id \|\| collectionId === null` + `--var` overrides. Keep the `.substitute()` / `.update()` API the runner already uses. |
| `cli/runner/runner.ts` (changed) | Iterate `folder.item[]` (PostmanItem tree) instead of flat `BundleRequest[]`. Adapt each `PostmanItem.request` shape into the runner's internal form before handing to `HttpClient`. |
| `cli/runner/extractor.ts` (retyped) | Same JSON-path / header extraction, but reads `DynamicVariable` (from `src/types/environment.ts`) rather than `BundleDynamicVariable`. |
| `cli/http/client.ts` | Unchanged. |
| `cli/reporter/console.ts` (small change) | Header prints `<project name> › <folder name> · env: <env title or "none">`. Per-request output unchanged. |
| `cli/commands/run.ts` (changed) | Wire loader → integrity check → selection → variable store → runner. |
| `shared/checksum.ts` (new) | Canonicalize + SHA-256. Used by both `projectHandlers.ts` and the CLI loader. |

## Shared types

The CLI needs `ProjectFile`, `PostmanFolder`, `PostmanItem`, `Environment`, `DynamicVariable`. Today these live in `src/types/` and the CLI's `tsconfig.cli.json` rootDir is separate.

Decision: **move** `src/types/project.ts`, `src/types/postman.ts`, and `src/types/environment.ts` into `shared/types/` and update all renderer/electron imports. This matches the precedent already set by `shared/types/bundle.ts` and avoids cross-rootDir include hacks. Update `tsconfig.json` paths if needed so the renderer still resolves them by the same specifier.

## Dependencies

- Add: `@inquirer/prompts` (^6.x or latest stable) — used only in the CLI.
- Remove: none. `chalk` and `commander` stay.

## Error matrix / exit codes

| Condition | Exit code | Message |
|---|---|---|
| Project file not found / unreadable | 2 | "Cannot read project file: <path>" |
| Invalid JSON | 2 | "Project file is not valid JSON: <err>" |
| Wrong shape (no `meta.version` or missing `data.collection`) | 2 | "Not a Rentgen project export." |
| Checksum gate declined | 1 | "Aborted by user." |
| Checksum gate blocked in non-TTY without `--unsafe` | 2 | "Checksum <missing\|mismatch>. Pass --unsafe to proceed." |
| Ambiguous `--collection` / `--env` name | 2 | Lists matching IDs. |
| `--collection` / `--env` not found | 2 | Lists available names+IDs. |
| Folder has zero requests | 2 | "Folder '<name>' has no requests." |
| All requests passed | 0 | Summary |
| Any request failed (non-2xx or network error) | 1 | Summary |
| SIGINT during run | 1 | Partial summary |

## Testing approach

No test runner is configured in this project (per `CLAUDE.md`). Validation is manual with smoke tests:

1. **Happy path (interactive):** run `rentgen run hudge-example-rentgen-project.rentgen`, arrow-pick a folder and env, verify requests fire and dynamic vars propagate within the run.
2. **Happy path (scripted):** run `rentgen run hudge-example-rentgen-project.rentgen --collection="All Requests" --env=none` — expect ambiguous-name error listing the two "All Requests" folder IDs; re-run with the ID.
3. **Idempotency:** diff `hudge-example-rentgen-project.rentgen` before and after a run — file must be byte-identical.
4. **Checksum gate:** hand-edit a value in the file, re-run, expect the confirmation prompt; re-run with `--unsafe`, expect no prompt.
5. **Non-TTY check:** pipe `/dev/null` into the CLI without flags, expect exit code 2.
6. **Regression:** open the desktop app — "Export CI Bundle" button is gone; "Export Project" still works end-to-end.

## Open questions

None. Design is ready for implementation plan.
