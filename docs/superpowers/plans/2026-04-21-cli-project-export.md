# CLI Project-Export Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the CLI's bespoke `rentgen.bundle.json` input with the existing `.rentgen` project export file, selecting one folder + one environment per invocation (via flags or interactive prompt), while guaranteeing idempotent runs and integrity via the existing SHA-256 checksum.

**Architecture:** The CLI reads a full `.rentgen` project export (the file format `handleExportProject` already writes), lets the user pick one folder and one environment, and runs that folder's requests against that environment using the in-memory `VariableStore`. The project file is never mutated. Shared types move from `src/types/` to `shared/types/`; the checksum helper moves from `electron/handlers/projectHandlers.ts` to `shared/checksum.ts` and is reused by both the Electron main process and the CLI. The CI-bundle surface (button, IPC handler, preload method, generator util, example file, bundle types) is deleted outright.

**Tech Stack:** TypeScript 5, Node 18+ (CLI runtime), Electron 40 (desktop), tsup (CLI bundler), commander (args), `@inquirer/prompts` (new — interactive selection), chalk (colour), axios (HTTP).

---

## File Structure (post-implementation)

New files:
- `shared/checksum.ts` — canonicalize + sha256 helper (shared by main process & CLI)
- `shared/types/environment.ts` — moved from `src/types/environment.ts`
- `shared/types/postman.ts` — moved from `src/types/postman.ts`
- `shared/types/project.ts` — moved from `src/types/project.ts` (history/settings widened to opaque)
- `cli/config/projectLoader.ts` — replaces `cli/config/loader.ts`; loads + validates + verifies checksum
- `cli/config/selection.ts` — resolve folder + environment from flags or interactive prompt
- `cli/runner/types.ts` — `RunResult`, `RequestResult`, `VerboseDetails` (replacing `BundleRunResult` / `BundleRequestResult`)

Rewritten files:
- `cli/config/variables.ts` — `VariableStore` built from `Environment.variables` + filtered `DynamicVariable[]` + CLI overrides
- `cli/runner/extractor.ts` — retyped to `DynamicVariable`
- `cli/runner/runner.ts` — iterates `PostmanFolder.item[]`
- `cli/reporter/console.ts` — new header format `<project name> › <folder name> · env: <env title or "none">`
- `cli/commands/run.ts` — wires loader → selection → variable store → runner
- `cli/index.ts` — new flag set (`--collection`, `--env`, `--unsafe`)

Modified files (light touches):
- `electron/handlers/projectHandlers.ts` — use `shared/checksum.ts`; types from `shared/types/project`
- `electron/handlers/importExportHandlers.ts` — remove `export-ci-bundle` handler + `RentgenBundle` import
- `electron/preload.ts` — remove `exportCIBundle` method + `RentgenBundle` import
- `electron/handlers/environmentHandlers.ts` — import types from `shared/types/environment`
- `src/types/index.ts` — re-export from `shared/types/*` instead of local files
- `src/types/ipc.ts` — import `PostmanCollection` from `shared/types/postman`
- `src/components/sidebar/colletion/CollectionGroup.tsx` — remove Export CI Bundle button + callback + `ciBundle` import
- `src/components/modals/ProjectImportConfirmModal.tsx` — cast `data.history` / `data.settings` at the two dispatch sites (because their types widen)
- `package.json` — add `@inquirer/prompts` dependency

Deleted files:
- `cli/config/loader.ts`
- `src/utils/ciBundle.ts`
- `shared/types/bundle.ts`
- `src/types/environment.ts`
- `src/types/postman.ts`
- `src/types/project.ts`
- `rentgen.bundle.json` (repo-root example)
- `hudge-example-rentgen-project.rentgen` stays — it's the new example input

---

## Tasks

### Task 1: Move shared types into `shared/types/`

**Why first:** Every subsequent task imports from these locations. Doing the move first produces a compile-clean baseline.

**Files:**
- Create: `shared/types/environment.ts`
- Create: `shared/types/postman.ts`
- Create: `shared/types/project.ts`
- Modify: `src/types/index.ts`
- Modify: `src/types/ipc.ts`
- Modify: `electron/handlers/projectHandlers.ts` (imports only)
- Modify: `electron/handlers/environmentHandlers.ts` (imports only)
- Modify: `electron/preload.ts` (imports only)
- Modify: `src/components/modals/ProjectImportConfirmModal.tsx` (add two casts)
- Delete: `src/types/environment.ts`, `src/types/postman.ts`, `src/types/project.ts`

- [ ] **Step 1: Create `shared/types/environment.ts`** with the exact content of `src/types/environment.ts` (no changes).

```typescript
/**
 * Environment variable key-value pair
 */
export interface EnvironmentVariable {
  key: string;
  value: string;
}

/**
 * Single environment definition
 */
export interface Environment {
  id: string;
  title: string;
  color: string;
  variables: EnvironmentVariable[];
}

/**
 * Dynamic variable that extracts values from API responses
 */
export interface DynamicVariable {
  /** Unique identifier: "dvar_{timestamp}_{random}" */
  id: string;

  /** Variable name used in {{variable}} syntax */
  key: string;

  /**
   * Extraction path:
   * - For body: dot/bracket notation (e.g., "data.user.id", "items[0].name")
   * - For header: header name (e.g., "X-Request-Id", "Authorization")
   */
  selector: string;

  /** Where to extract the value from */
  source: 'body' | 'header';

  /** ID of the collection containing the linked request */
  collectionId: string;

  /** ID of the linked request within the collection */
  requestId: string;

  /** Last successfully extracted value (null if never extracted) */
  currentValue: string | null;

  /** Timestamp of last successful extraction (null if never extracted) */
  lastUpdated: number | null;

  /**
   * Environment scope:
   * - null: Applies to ALL environments
   * - string: Applies only to specific environment ID
   */
  environmentId: string | null;
}

/**
 * Result of validating dynamic variables before request execution
 */
export interface VariableValidationResult {
  isValid: boolean;
  missingVariables: string[];
}

/**
 * Result of extracting a dynamic variable from a response
 */
export interface ExtractionResult {
  value: string | null;
  success: boolean;
  error?: string;
}

/**
 * Details about a failed dynamic variable extraction
 */
export interface ExtractionFailure {
  variableName: string;
  selector: string;
  source: 'body' | 'header';
  reason: string;
}
```

- [ ] **Step 2: Create `shared/types/postman.ts`** with the exact content of `src/types/postman.ts` (no changes).

```typescript
// Postman Collection Format v2 Types
export interface PostmanHeader {
  key: string;
  value: string;
}

export interface PostmanBody {
  mode: 'raw' | 'formdata' | 'urlencoded';
  raw?: string;
}

export interface PostmanRequest {
  method: string;
  url: string;
  header: PostmanHeader[];
  body?: PostmanBody;
}

export interface PostmanItem {
  id: string;
  name: string;
  request: PostmanRequest;
}

export interface PostmanFolder {
  id: string;
  name: string;
  item: PostmanItem[];
}

export interface PostmanCollectionInfo {
  name: string;
  description: string;
  schema: string;
}

export interface PostmanCollection {
  info: PostmanCollectionInfo;
  item: PostmanFolder[];
}
```

- [ ] **Step 3: Create `shared/types/project.ts`** with widened `history` and `settings` (so `shared/` has no dependency on `src/`).

```typescript
import { PostmanCollection } from './postman';
import { DynamicVariable, Environment } from './environment';

/** Data payload inside a .rentgen export file. `history` and `settings`
 *  are opaque to shared consumers (the CLI does not interpret them). The
 *  renderer narrows them at dispatch sites via `as` casts. */
export interface ProjectData {
  collection: PostmanCollection;
  environments: Environment[];
  dynamicVariables: DynamicVariable[];
  history: unknown[];
  settings: Record<string, unknown>;
}

/** Metadata header of a .rentgen export file */
export interface ProjectMeta {
  version: number;
  appVersion: string;
  exportedAt: string;
  checksum: string;
}

/** Complete .rentgen file structure */
export interface ProjectFile {
  meta: ProjectMeta;
  data: ProjectData;
}

/** Integrity verification result */
export type IntegrityStatus = 'verified' | 'modified' | 'missing';

/** Result returned from the import-project IPC handler */
export interface ProjectImportResult {
  canceled?: boolean;
  success?: boolean;
  error?: string;
  data?: ProjectData;
  meta?: ProjectMeta;
  integrityStatus?: IntegrityStatus;
  fileName?: string;
}

/** Result returned from the export-project IPC handler */
export interface ProjectExportResult {
  canceled?: boolean;
  success?: boolean;
  error?: string;
  filePath?: string;
}
```

- [ ] **Step 4: Update `src/types/index.ts`** — replace the three `export * from './environment'`, `export * from './postman'`, `export * from './project'` lines with re-exports from the shared location.

Replace lines 130-134 of `src/types/index.ts`:

```typescript
export * from './environment';
export * from './ipc';
export * from './postman';
export * from './postman-full';
export * from './project';
```

with:

```typescript
export * from '../../shared/types/environment';
export * from './ipc';
export * from '../../shared/types/postman';
export * from './postman-full';
export * from '../../shared/types/project';
```

- [ ] **Step 5: Update `src/types/ipc.ts`** — change the `PostmanCollection` import so it no longer points to the (about-to-be-deleted) local `./postman`.

Replace line 1 of `src/types/ipc.ts`:

```typescript
import { PostmanCollection } from './postman';
```

with:

```typescript
import { PostmanCollection } from '../../shared/types/postman';
```

- [ ] **Step 6: Update `electron/handlers/projectHandlers.ts`** import path.

Replace lines 5-11:

```typescript
import type {
  IntegrityStatus,
  ProjectData,
  ProjectExportResult,
  ProjectFile,
  ProjectImportResult,
} from '../../src/types';
```

with:

```typescript
import type {
  IntegrityStatus,
  ProjectData,
  ProjectExportResult,
  ProjectFile,
  ProjectImportResult,
} from '../../shared/types/project';
```

- [ ] **Step 7: Update `electron/handlers/environmentHandlers.ts`** to import `DynamicVariable`, `Environment` from shared.

Find the current line (line 4):

```typescript
import type { DynamicVariable, Environment } from '../../src/types';
```

Replace with:

```typescript
import type { DynamicVariable, Environment } from '../../shared/types/environment';
```

Leave other imports in that file alone.

- [ ] **Step 8: Delete `src/types/environment.ts`, `src/types/postman.ts`, `src/types/project.ts`.**

```bash
rm src/types/environment.ts src/types/postman.ts src/types/project.ts
```

- [ ] **Step 9: Fix the two narrowing sites in `ProjectImportConfirmModal.tsx`.**

The dispatches `historyActions.setEntries(data.history)` and `settingsActions.replaceSettings(data.settings)` now receive `unknown[]` / `Record<string, unknown>`. Add inline casts so those calls keep type-checking.

In `src/components/modals/ProjectImportConfirmModal.tsx`, find:

```typescript
    dispatch(historyActions.setEntries(data.history));
    dispatch(settingsActions.replaceSettings(data.settings));
```

Look at the existing imports in that file to identify the action-payload types. They are the arg types of `historyActions.setEntries` and `settingsActions.replaceSettings` — likely `HistoryEntry[]` and `SettingsState`. Add the two imports if they aren't already present:

```typescript
import type { HistoryEntry } from '../../types/history';
import type { SettingsState } from '../../store/slices/settingsSlice';
```

Then change the two dispatch lines to:

```typescript
    dispatch(historyActions.setEntries(data.history as HistoryEntry[]));
    dispatch(settingsActions.replaceSettings(data.settings as SettingsState));
```

(Add/adjust the import paths to match what the file already uses — the surrounding imports show the conventional relative depth.)

- [ ] **Step 10: Lint.**

```bash
npm run lint
```

Expected: PASS with no new errors related to the renamed imports. If anything else red-flags (there should be no new failures from this move), fix before committing.

- [ ] **Step 11: Verify renderer + electron still typecheck implicitly via a quick dev spin-up.**

```bash
npm start
```

Expected: app launches, you see the home screen. Close it.

- [ ] **Step 12: Commit.**

```bash
git add shared/types src/types electron/handlers src/components/modals/ProjectImportConfirmModal.tsx
git commit -m "refactor: move project/postman/environment types to shared/"
```

---

### Task 2: Extract shared checksum helper

**Files:**
- Create: `shared/checksum.ts`
- Modify: `electron/handlers/projectHandlers.ts`

- [ ] **Step 1: Create `shared/checksum.ts`.** This is a lift-and-shift of the canonicalize + computeChecksum + verifyChecksum helpers from `projectHandlers.ts`. Keep the byte-for-byte algorithm identical — the CLI depends on this producing the same hash as the desktop app wrote.

```typescript
import crypto from 'crypto';
import type { IntegrityStatus, ProjectData } from './types/project';

/** Deterministic JSON stringify: non-array objects have their keys sorted alphabetically.
 *  Arrays keep their order. */
export function canonicalize(obj: unknown): string {
  return JSON.stringify(obj, (_key, value) => {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return Object.keys(value)
        .sort()
        .reduce<Record<string, unknown>>((sorted, k) => {
          sorted[k] = (value as Record<string, unknown>)[k];
          return sorted;
        }, {});
    }
    return value;
  });
}

/** SHA-256 of the canonicalized data, prefixed with "sha256:". */
export function computeChecksum(data: ProjectData): string {
  const canonical = canonicalize(data);
  return `sha256:${crypto.createHash('sha256').update(canonical, 'utf-8').digest('hex')}`;
}

export function verifyChecksum(checksum: string | undefined, data: ProjectData): IntegrityStatus {
  if (!checksum) return 'missing';
  return computeChecksum(data) === checksum ? 'verified' : 'modified';
}
```

- [ ] **Step 2: Refactor `electron/handlers/projectHandlers.ts`** to import from `shared/checksum.ts` and delete the three local helper definitions.

Remove lines 2 (the `crypto` import — no longer needed locally) and lines 20-42 (the three helper function declarations).

Add import after the other imports:

```typescript
import { computeChecksum, verifyChecksum } from '../../shared/checksum';
```

The `canonicalize` name is not used elsewhere — do not import it.

Verify both remaining callsites still compile: `computeChecksum(data)` at the export site, `verifyChecksum(parsed.meta.checksum, parsed.data)` at the import site. They should.

- [ ] **Step 3: Smoke-test the desktop export/import round-trip.**

```bash
npm start
```

- In the desktop app, export a project (it will produce a `.rentgen` file).
- Re-import the same file. You should see the "Project is verified" state (the checksum matches).
- Close the app.

- [ ] **Step 4: Verify the checksum is stable vs. the existing sample file.**

```bash
node -e "const fs=require('fs'); const {computeChecksum}=require('./shared/checksum'); const f=JSON.parse(fs.readFileSync('hudge-example-rentgen-project.rentgen','utf-8')); console.log('stored: ', f.meta.checksum); console.log('computed:', computeChecksum(f.data));"
```

Expected: the two lines match byte-for-byte (the canonicalization algorithm is identical to what wrote the file).

If they don't match, STOP — the algorithm diverged. Re-check the `canonicalize` port character-for-character.

- [ ] **Step 5: Commit.**

```bash
git add shared/checksum.ts electron/handlers/projectHandlers.ts
git commit -m "refactor: move canonicalize+checksum helpers to shared/"
```

---

### Task 3: Add `@inquirer/prompts` dependency

**Files:**
- Modify: `package.json`, `package-lock.json`

- [ ] **Step 1: Install.**

```bash
npm install @inquirer/prompts
```

This picks the current latest (resolving to ^7.x as of writing; ^6.x is also acceptable per the spec).

- [ ] **Step 2: Sanity-check the resolved version.**

```bash
node -e "console.log(require('./package.json').dependencies['@inquirer/prompts'])"
```

Expected: a semver range matching 6 or 7.

- [ ] **Step 3: Commit.**

```bash
git add package.json package-lock.json
git commit -m "feat(cli): add @inquirer/prompts for interactive selection"
```

---

### Task 4: Rewrite CLI loader (`cli/config/projectLoader.ts`)

**Files:**
- Delete: `cli/config/loader.ts`
- Create: `cli/config/projectLoader.ts`

- [ ] **Step 1: Delete `cli/config/loader.ts`.** (Its symbol `loadBundle` is replaced with `loadProject`. The command file will be updated in Task 10.)

```bash
rm cli/config/loader.ts
```

This breaks `cli/commands/run.ts`'s build momentarily; we accept that and fix it in Task 10. The build is already broken the moment we touch `shared/types/bundle.ts` anyway.

- [ ] **Step 2: Create `cli/config/projectLoader.ts`** — responsible for reading the file, parsing JSON, validating the shape, computing the checksum, and returning the integrity status alongside the data. It does NOT prompt the user or decide what to do on mismatch — that belongs in `run.ts` (where we know whether we're in a TTY and what `--unsafe` is set to).

```typescript
import * as fs from 'fs';
import * as path from 'path';
import { computeChecksum } from '../../shared/checksum';
import type {
  IntegrityStatus,
  ProjectData,
  ProjectFile,
  ProjectMeta,
} from '../../shared/types/project';

export interface LoadedProject {
  file: ProjectFile;
  integrity: IntegrityStatus;
  filePath: string;
}

/** Load, parse, and validate a .rentgen project file. Verifies the checksum
 *  if present. Never prompts and never writes. Exits the process (code 2) on
 *  non-recoverable errors (missing file, bad JSON, wrong shape). */
export function loadProject(filePath: string): LoadedProject {
  const resolved = path.resolve(filePath);

  if (!fs.existsSync(resolved)) {
    console.error(`Cannot read project file: ${resolved}`);
    process.exit(2);
  }

  let raw: string;
  try {
    raw = fs.readFileSync(resolved, 'utf-8');
  } catch (err) {
    console.error(`Cannot read project file: ${resolved}`);
    console.error(`  ${err instanceof Error ? err.message : String(err)}`);
    process.exit(2);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    console.error(`Project file is not valid JSON: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(2);
  }

  if (!isProjectFile(parsed)) {
    console.error('Not a Rentgen project export.');
    process.exit(2);
  }

  const integrity: IntegrityStatus = parsed.meta.checksum
    ? computeChecksum(parsed.data) === parsed.meta.checksum ? 'verified' : 'modified'
    : 'missing';

  return { file: parsed, integrity, filePath: resolved };
}

function isProjectFile(value: unknown): value is ProjectFile {
  if (!value || typeof value !== 'object') return false;
  const file = value as Record<string, unknown>;
  if (!isProjectMeta(file.meta)) return false;
  if (!isProjectData(file.data)) return false;
  return true;
}

function isProjectMeta(value: unknown): value is ProjectMeta {
  if (!value || typeof value !== 'object') return false;
  const m = value as Record<string, unknown>;
  if (typeof m.version !== 'number') return false;
  if (typeof m.appVersion !== 'string') return false;
  if (typeof m.exportedAt !== 'string') return false;
  // checksum is optional for "missing" state
  if (m.checksum !== undefined && typeof m.checksum !== 'string') return false;
  return true;
}

function isProjectData(value: unknown): value is ProjectData {
  if (!value || typeof value !== 'object') return false;
  const d = value as Record<string, unknown>;
  if (!d.collection || typeof d.collection !== 'object') return false;
  if (!Array.isArray(d.environments)) return false;
  if (!Array.isArray(d.dynamicVariables)) return false;
  // history/settings are opaque in shared types; just check they exist
  return 'history' in d && 'settings' in d;
}
```

- [ ] **Step 3: Commit.**

```bash
git add cli/config/projectLoader.ts cli/config/loader.ts
git commit -m "feat(cli): load .rentgen project files with checksum verification"
```

(`git add` picks up the delete implicitly; the commit records the rename-in-spirit.)

---

### Task 5: Create selection module (`cli/config/selection.ts`)

**Files:**
- Create: `cli/config/selection.ts`

- [ ] **Step 1: Create `cli/config/selection.ts`.** This resolves the user's choice of folder and environment from either (a) explicit flags (`--collection`, `--env`) or (b) interactive prompts via `@inquirer/prompts`. It also encodes the spec's error handling: ambiguous names, not-found, the `--env=none` reserved keyword, and non-TTY fail-closed.

The sample project contains two folders both named `"All Requests"` and 50+ environments with duplicate titles, so the ambiguous-match path is not theoretical.

```typescript
import { select } from '@inquirer/prompts';
import type { Environment } from '../../shared/types/environment';
import type { PostmanCollection, PostmanFolder } from '../../shared/types/postman';

export interface Selection {
  folder: PostmanFolder;
  environment: Environment | null;
}

const NONE_SENTINEL = 'none';

interface Options {
  collectionArg: string | undefined;
  envArg: string | undefined;
}

export async function resolveSelection(
  collection: PostmanCollection,
  environments: Environment[],
  options: Options,
): Promise<Selection> {
  const folder = await resolveFolder(collection.item, options.collectionArg);

  if (folder.item.length === 0) {
    console.error(`Folder '${folder.name}' has no requests.`);
    process.exit(2);
  }

  const environment = await resolveEnvironment(environments, options.envArg);

  return { folder, environment };
}

async function resolveFolder(
  folders: PostmanFolder[],
  arg: string | undefined,
): Promise<PostmanFolder> {
  if (folders.length === 0) {
    console.error('Project has no folders.');
    process.exit(2);
  }

  if (arg !== undefined) {
    return lookupFolderByArg(folders, arg);
  }

  if (!process.stdin.isTTY) {
    console.error('CI mode detected — pass --collection and --env explicitly.');
    process.exit(2);
  }

  return select<PostmanFolder>({
    message: 'Select folder to run',
    choices: folders.map((f) => ({
      name: f.name,
      value: f,
      description: `${f.id} · ${f.item.length} request${f.item.length === 1 ? '' : 's'}`,
    })),
  });
}

function lookupFolderByArg(folders: PostmanFolder[], arg: string): PostmanFolder {
  // Exact ID first
  const byId = folders.find((f) => f.id === arg);
  if (byId) return byId;

  // Then by name (case-sensitive, per spec — titles can have intentional casing)
  const byName = folders.filter((f) => f.name === arg);
  if (byName.length === 1) return byName[0];

  if (byName.length > 1) {
    console.error(`Multiple folders match '${arg}':`);
    for (const f of byName) console.error(`  ${f.id}  (${f.item.length} requests)`);
    console.error('Re-run with the exact --collection <id>.');
    process.exit(2);
  }

  console.error(`No folder matches '${arg}'. Available folders:`);
  for (const f of folders) console.error(`  ${f.name}  [${f.id}]`);
  process.exit(2);
}

async function resolveEnvironment(
  environments: Environment[],
  arg: string | undefined,
): Promise<Environment | null> {
  // --env=none (any case) means run with no environment
  if (arg !== undefined && arg.toLowerCase() === NONE_SENTINEL) {
    return null;
  }

  if (environments.length === 0) {
    // Project has no environments — silently run with none
    return null;
  }

  if (arg !== undefined) {
    return lookupEnvByArg(environments, arg);
  }

  if (!process.stdin.isTTY) {
    console.error('CI mode detected — pass --collection and --env explicitly.');
    process.exit(2);
  }

  return select<Environment | null>({
    message: 'Select environment',
    choices: [
      { name: '— No environment —', value: null },
      ...environments.map((e) => ({
        name: e.title,
        value: e,
        description: e.id,
      })),
    ],
  });
}

function lookupEnvByArg(environments: Environment[], arg: string): Environment {
  const byId = environments.find((e) => e.id === arg);
  if (byId) return byId;

  const byTitle = environments.filter((e) => e.title === arg);
  if (byTitle.length === 1) return byTitle[0];

  if (byTitle.length > 1) {
    console.error(`Multiple environments match '${arg}':`);
    for (const e of byTitle) console.error(`  ${e.id}`);
    console.error('Re-run with the exact --env <id>.');
    process.exit(2);
  }

  console.error(`No environment matches '${arg}'. Available:`);
  console.error('  none  (run with no environment)');
  for (const e of environments) console.error(`  ${e.title}  [${e.id}]`);
  process.exit(2);
}
```

- [ ] **Step 2: Commit.**

```bash
git add cli/config/selection.ts
git commit -m "feat(cli): resolve folder+env via flag or interactive prompt"
```

---

### Task 6: Rewrite VariableStore (`cli/config/variables.ts`)

**Files:**
- Modify (complete rewrite): `cli/config/variables.ts`

- [ ] **Step 1: Rewrite `cli/config/variables.ts`** from scratch. The new constructor takes `Environment | null`, filtered `DynamicVariable[]`, and `Record<string, string>` overrides. It keeps the runner-facing API: `substitute(text)`, `substituteRequest(request)`, `getDynamicVarsForRequest(id)`, and `update(key, value)`. Unresolved variables encountered during substitution are tracked so the reporter can warn about them under `--verbose`.

```typescript
import type { DynamicVariable, Environment, EnvironmentVariable } from '../../shared/types/environment';
import type { PostmanItem, PostmanRequest, PostmanHeader } from '../../shared/types/postman';

export interface ResolvedRequest {
  id: string;
  name: string;
  method: string;
  url: string;
  headers: PostmanHeader[];
  body?: string;
}

export class VariableStore {
  private variables: Map<string, string>;
  private dynamicVarsByRequestId: Map<string, DynamicVariable[]>;
  private lastUnresolved: Set<string> = new Set();

  constructor(
    environment: Environment | null,
    dynamicVariables: DynamicVariable[],
    cliOverrides: Record<string, string>,
  ) {
    this.variables = new Map();
    this.dynamicVarsByRequestId = new Map();

    // 1. Environment static variables (lowest priority)
    if (environment) {
      for (const v of environment.variables) {
        this.variables.set(v.key, v.value);
      }
    }

    // 2. Dynamic variable initial values (from file's currentValue)
    for (const dv of dynamicVariables) {
      if (dv.currentValue !== null) {
        this.variables.set(dv.key, dv.currentValue);
      }
    }

    // 3. CLI --var overrides (highest priority)
    for (const [key, value] of Object.entries(cliOverrides)) {
      this.variables.set(key, value);
    }

    // 4. Index dynamic vars by requestId for fast runtime lookup
    for (const dv of dynamicVariables) {
      const existing = this.dynamicVarsByRequestId.get(dv.requestId) ?? [];
      existing.push(dv);
      this.dynamicVarsByRequestId.set(dv.requestId, existing);
    }
  }

  /** Replace {{var}} tokens. Missing tokens resolve to empty string (desktop parity)
   *  and are recorded so the reporter can warn under --verbose. */
  substitute(text: string): string {
    return text.replace(/\{\{([^}]+)\}\}/g, (_match, rawKey: string) => {
      const key = rawKey.trim();
      const value = this.variables.get(key);
      if (value === undefined) {
        this.lastUnresolved.add(key);
        return '';
      }
      return value;
    });
  }

  /** Resolve all substitutable fields of a PostmanItem's request. */
  substituteRequest(item: PostmanItem): ResolvedRequest {
    this.lastUnresolved.clear();
    const r: PostmanRequest = item.request;
    return {
      id: item.id,
      name: item.name,
      method: r.method,
      url: this.substitute(r.url),
      headers: r.header.map((h) => ({
        key: h.key,
        value: this.substitute(h.value),
      })),
      body: r.body?.raw !== undefined ? this.substitute(r.body.raw) : undefined,
    };
  }

  /** Names of variables that were not found on the most recent substituteRequest call. */
  getLastUnresolved(): string[] {
    return Array.from(this.lastUnresolved);
  }

  getDynamicVarsForRequest(requestId: string): DynamicVariable[] {
    return this.dynamicVarsByRequestId.get(requestId) ?? [];
  }

  update(key: string, value: string): void {
    this.variables.set(key, value);
  }
}

/** Parse `--var key=value` flag values into a map. Exits with code 2 on malformed input. */
export function parseVarOverrides(vars: string[]): Record<string, string> {
  const result: Record<string, string> = {};
  for (const entry of vars) {
    const eqIndex = entry.indexOf('=');
    if (eqIndex === -1) {
      console.error(`Invalid --var format: "${entry}"`);
      console.error('Use --var key=value (e.g., --var apiKey=abc123)');
      process.exit(2);
    }
    result[entry.slice(0, eqIndex)] = entry.slice(eqIndex + 1);
  }
  return result;
}

/** Filter dynamic variables to those that apply when running a given folder:
 *  the dvar belongs to this folder (collectionId === folder.id) or is global
 *  (collectionId is null or empty string). Per spec. */
export function filterDynamicVarsForFolder(
  all: DynamicVariable[],
  folderId: string,
): DynamicVariable[] {
  return all.filter((dv) => {
    const cid = (dv as { collectionId: string | null }).collectionId;
    return cid === folderId || cid === null || cid === '';
  });
}

// Re-export for runner's convenience (previously used the environment variable array directly)
export type { EnvironmentVariable };
```

- [ ] **Step 2: Commit.**

```bash
git add cli/config/variables.ts
git commit -m "feat(cli): rebuild VariableStore on Environment + DynamicVariable"
```

---

### Task 7: Runner types + retyped extractor

**Files:**
- Create: `cli/runner/types.ts`
- Modify (rewrite): `cli/runner/extractor.ts`

- [ ] **Step 1: Create `cli/runner/types.ts`** — these are the runner's output shapes. They used to come from `shared/types/bundle.ts`; now they live alongside the runner because they're CLI-internal.

```typescript
export interface RequestResult {
  requestId: string;
  requestName: string;
  method: string;
  url: string;
  status: number | null;
  statusText: string;
  /** true when HTTP status is 2xx */
  success: boolean;
  /** Request duration in ms */
  duration: number;
  error: string | null;
  dynamicVarsExtracted: { key: string; value: string }[];
  dynamicVarsFailed: { key: string; error: string }[];
  /** Populated when --verbose is set */
  verbose?: VerboseDetails;
}

export interface VerboseDetails {
  requestHeaders: Record<string, string>;
  requestBody?: string;
  responseHeaders: Record<string, string>;
  responseBody: string;
  dynamicVarDetails: DynamicVarDetail[];
  unresolvedVariables: string[];
}

export interface DynamicVarDetail {
  key: string;
  selector: string;
  source: 'body' | 'header';
  extracted: boolean;
  value?: string;
  error?: string;
}

export interface RunResult {
  success: boolean;
  totalRequests: number;
  passed: number;
  failed: number;
  errors: number;
  /** Total run duration in ms */
  duration: number;
  results: RequestResult[];
}
```

- [ ] **Step 2: Rewrite `cli/runner/extractor.ts`** — same algorithm (JSON path extraction or case-insensitive header lookup), but typed against `DynamicVariable` from `shared/types/environment`.

```typescript
import type { DynamicVariable } from '../../shared/types/environment';
import type { HttpResponse } from '../http/client';

export interface ExtractionOutcome {
  success: boolean;
  value: string | null;
  error?: string;
}

/** Navigate dot/bracket notation (e.g. "data.users[0].id") into a parsed object. */
function extractValue(obj: unknown, selector: string): unknown {
  if (!selector || obj === null || obj === undefined) return undefined;

  const segments = selector
    .replace(/\[(\d+)]/g, '.$1')
    .split('.')
    .filter(Boolean);

  let current: unknown = obj;
  for (const segment of segments) {
    if (current === null || current === undefined) return undefined;
    if (typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[segment];
  }
  return current;
}

function stringifyExtractedValue(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return JSON.stringify(value);
}

export function extractDynamicVariable(
  dvar: DynamicVariable,
  response: HttpResponse,
): ExtractionOutcome {
  try {
    let extractedValue: unknown;

    if (dvar.source === 'body') {
      if (!response.body) {
        return { success: false, value: null, error: 'response body is empty' };
      }

      let body: unknown;
      try {
        body = JSON.parse(response.body);
      } catch {
        return { success: false, value: null, error: 'response body is not valid JSON' };
      }

      extractedValue = extractValue(body, dvar.selector);
      if (extractedValue === undefined) {
        return { success: false, value: null, error: `selector '${dvar.selector}' not found in response` };
      }
    } else if (dvar.source === 'header') {
      if (!response.headers) {
        return { success: false, value: null, error: 'response has no headers' };
      }
      const headerKey = Object.keys(response.headers).find(
        (k) => k.toLowerCase() === dvar.selector.toLowerCase(),
      );
      extractedValue = headerKey ? response.headers[headerKey] : undefined;
      if (extractedValue === undefined) {
        return { success: false, value: null, error: `header '${dvar.selector}' not found in response` };
      }
    }

    const stringValue = stringifyExtractedValue(extractedValue);
    if (stringValue === null) {
      return { success: false, value: null, error: 'extracted value is null or undefined' };
    }

    return { success: true, value: stringValue };
  } catch (e) {
    return { success: false, value: null, error: String(e) };
  }
}
```

- [ ] **Step 3: Commit.**

```bash
git add cli/runner/types.ts cli/runner/extractor.ts
git commit -m "refactor(cli): retype runner outputs and extractor against shared types"
```

---

### Task 8: Rewrite runner (`cli/runner/runner.ts`)

**Files:**
- Modify (rewrite): `cli/runner/runner.ts`

- [ ] **Step 1: Rewrite `cli/runner/runner.ts`** to iterate `PostmanFolder.item[]` directly (one level — no nested folders per spec).

```typescript
import type { Environment } from '../../shared/types/environment';
import type { PostmanFolder, PostmanItem } from '../../shared/types/postman';
import { HttpClient, type HttpResponse } from '../http/client';
import { VariableStore } from '../config/variables';
import { extractDynamicVariable } from './extractor';
import type { DynamicVarDetail, RequestResult, RunResult } from './types';

export interface RunnerOptions {
  stopOnFailure: boolean;
  timeout: number;
  verbose: boolean;
}

type ResultCallback = (result: RequestResult, index: number, total: number) => void;

export class SequentialRunner {
  private httpClient: HttpClient;
  private results: RequestResult[] = [];
  private resultCallback: ResultCallback | null = null;
  private aborted = false;

  constructor(
    private folder: PostmanFolder,
    private environment: Environment | null,
    private options: RunnerOptions,
    private variableStore: VariableStore,
  ) {
    this.httpClient = new HttpClient(options.timeout);
  }

  onResult(callback: ResultCallback): void {
    this.resultCallback = callback;
  }

  abort(): void {
    this.aborted = true;
  }

  getPartialSummary(): RunResult {
    return this.buildSummary(0);
  }

  async run(): Promise<RunResult> {
    const startTime = performance.now();
    const items = this.folder.item;
    const total = items.length;

    for (let i = 0; i < items.length; i++) {
      if (this.aborted) break;

      const result = await this.executeItem(items[i]);
      this.results.push(result);

      this.resultCallback?.(result, i + 1, total);

      if (!result.success && this.options.stopOnFailure) break;
    }

    return this.buildSummary(performance.now() - startTime);
  }

  private async executeItem(item: PostmanItem): Promise<RequestResult> {
    const resolved = this.variableStore.substituteRequest(item);
    const unresolvedNow = this.variableStore.getLastUnresolved();

    const headers: Record<string, string> = {};
    for (const h of resolved.headers) headers[h.key] = h.value;

    let response: HttpResponse;
    try {
      response = await this.httpClient.send({
        method: resolved.method,
        url: resolved.url,
        headers,
        body: resolved.body,
      });
    } catch (error) {
      return {
        requestId: item.id,
        requestName: item.name,
        method: item.request.method,
        url: resolved.url,
        status: null,
        statusText: 'Network Error',
        success: false,
        duration: 0,
        error: error instanceof Error ? error.message : String(error),
        dynamicVarsExtracted: [],
        dynamicVarsFailed: [],
        ...(this.options.verbose && {
          verbose: {
            requestHeaders: headers,
            requestBody: resolved.body,
            responseHeaders: {},
            responseBody: '',
            dynamicVarDetails: [],
            unresolvedVariables: unresolvedNow,
          },
        }),
      };
    }

    const dvarsExtracted: { key: string; value: string }[] = [];
    const dvarsFailed: { key: string; error: string }[] = [];
    const dynamicVarDetails: DynamicVarDetail[] = [];

    for (const dvar of this.variableStore.getDynamicVarsForRequest(item.id)) {
      const outcome = extractDynamicVariable(dvar, response);
      if (outcome.success && outcome.value !== null) {
        this.variableStore.update(dvar.key, outcome.value);
        dvarsExtracted.push({ key: dvar.key, value: outcome.value });
        dynamicVarDetails.push({
          key: dvar.key,
          selector: dvar.selector,
          source: dvar.source,
          extracted: true,
          value: outcome.value,
        });
      } else {
        dvarsFailed.push({ key: dvar.key, error: outcome.error ?? 'Unknown error' });
        dynamicVarDetails.push({
          key: dvar.key,
          selector: dvar.selector,
          source: dvar.source,
          extracted: false,
          error: outcome.error ?? 'Unknown error',
        });
      }
    }

    const success = response.statusCode >= 200 && response.statusCode < 300;

    const result: RequestResult = {
      requestId: item.id,
      requestName: item.name,
      method: item.request.method,
      url: resolved.url,
      status: response.statusCode,
      statusText: response.status,
      success,
      duration: response.duration,
      error: null,
      dynamicVarsExtracted: dvarsExtracted,
      dynamicVarsFailed: dvarsFailed,
    };

    if (this.options.verbose) {
      result.verbose = {
        requestHeaders: headers,
        requestBody: resolved.body,
        responseHeaders: response.headers,
        responseBody: response.body,
        dynamicVarDetails,
        unresolvedVariables: unresolvedNow,
      };
    }

    return result;
  }

  private buildSummary(duration: number): RunResult {
    const results = this.results;
    return {
      success: results.length > 0 && results.every((r) => r.success),
      totalRequests: results.length,
      passed: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success && !r.error).length,
      errors: results.filter((r) => r.error !== null).length,
      duration: Math.round(duration),
      results,
    };
  }
}
```

Note: `this.environment` is stored but only used by the reporter-header path indirectly (via `run.ts`). Keeping it on the runner means future enhancements (per-env-scope filtering) don't need a signature change; it's a 16-byte reference, worth it for the ergonomic wiring.

- [ ] **Step 2: Commit.**

```bash
git add cli/runner/runner.ts
git commit -m "feat(cli): runner iterates PostmanFolder.item[] against selected env"
```

---

### Task 9: Update console reporter header (`cli/reporter/console.ts`)

**Files:**
- Modify: `cli/reporter/console.ts`

- [ ] **Step 1: Replace the import from `shared/types/bundle`** (which is about to be deleted) and update `printHeader` to accept project + folder + env names instead of a `RentgenBundle`. Also wire the unresolved-variable warning under `--verbose`.

Replace the file with:

```typescript
import chalk from 'chalk';
import type { RequestResult, RunResult, VerboseDetails } from '../runner/types';

export interface HeaderContext {
  projectName: string;
  folderName: string;
  environmentTitle: string | null;
  totalRequests: number;
}

export class ConsoleReporter {
  constructor(private options: { verbose: boolean; noColor: boolean }) {
    if (options.noColor) {
      chalk.level = 0;
    }
  }

  printHeader(ctx: HeaderContext): void {
    const envLabel = ctx.environmentTitle ?? 'none';
    process.stdout.write(chalk.bold('Rentgen CLI v1.0.0') + '\n');
    process.stdout.write('\n');
    process.stdout.write(
      `${ctx.projectName} › ${ctx.folderName} · env: ${envLabel} (${ctx.totalRequests} requests)\n`,
    );
    process.stdout.write(chalk.dim('─'.repeat(40)) + '\n');
    process.stdout.write('\n');
  }

  printResult(result: RequestResult, index: number, total: number): void {
    const tag = `[${index}/${total}]`;
    process.stdout.write(`${tag} ${result.method} ${result.url}\n`);

    if (result.error) {
      const lines = result.error.split('\n');
      process.stdout.write(`      ${chalk.red('✗')} ${chalk.red(`Network Error: ${lines[0]}`)}\n`);
      for (let i = 1; i < lines.length; i++) {
        process.stdout.write(`        ${chalk.dim(lines[i])}\n`);
      }
    } else if (result.success) {
      process.stdout.write(
        `      ${chalk.green('✓')} ${chalk.green(result.statusText)} ${chalk.dim(`(${result.duration}ms)`)}\n`,
      );
    } else {
      process.stdout.write(
        `      ${chalk.red('✗')} ${chalk.red(result.statusText)} ${chalk.dim(`(${result.duration}ms)`)}\n`,
      );
    }

    if (this.options.verbose && result.verbose) {
      this.printVerboseDetails(result.verbose);
    }

    process.stdout.write('\n');
  }

  printSummary(result: RunResult): void {
    process.stdout.write(chalk.dim('─'.repeat(40)) + '\n');

    const parts = [
      result.passed > 0 ? chalk.green(`${result.passed} passed`) : `${result.passed} passed`,
      result.failed > 0 ? chalk.red(`${result.failed} failed`) : `${result.failed} failed`,
    ];
    if (result.errors > 0) parts.push(chalk.red(`${result.errors} errors`));

    process.stdout.write(`Results: ${parts.join(', ')}\n`);
    process.stdout.write(`Duration: ${this.formatDuration(result.duration)}\n`);

    const failed = result.results.filter((r) => !r.success);
    if (failed.length > 0) {
      process.stdout.write('\n');
      process.stdout.write(chalk.red('Failed:') + '\n');
      for (const r of failed) {
        const idx = result.results.indexOf(r) + 1;
        const total = result.totalRequests;
        const path = this.extractPath(r.url);
        const errorFirstLine = r.error?.split('\n')[0] ?? '';
        const reason = r.error ? `Network Error: ${errorFirstLine}` : r.statusText;
        process.stdout.write(`  [${idx}/${total}] ${r.method} ${path} — ${reason}\n`);
      }
    }
  }

  private printVerboseDetails(verbose: VerboseDetails): void {
    if (verbose.unresolvedVariables.length > 0) {
      process.stdout.write(
        `      ${chalk.yellow('⚠')} ${chalk.yellow(
          `Unresolved variables (substituted as empty string): ${verbose.unresolvedVariables.join(', ')}`,
        )}\n`,
      );
    }

    process.stdout.write(chalk.dim('      Request Headers:') + '\n');
    for (const [key, value] of Object.entries(verbose.requestHeaders)) {
      process.stdout.write(chalk.dim(`        ${key}: ${value}`) + '\n');
    }

    if (verbose.requestBody) {
      process.stdout.write(chalk.dim('      Request Body:') + '\n');
      process.stdout.write(chalk.dim(`        ${this.truncate(verbose.requestBody, 500)}`) + '\n');
    }

    process.stdout.write(chalk.dim('      Response Headers:') + '\n');
    for (const [key, value] of Object.entries(verbose.responseHeaders)) {
      process.stdout.write(chalk.dim(`        ${key}: ${value}`) + '\n');
    }

    process.stdout.write(chalk.dim('      Response Body:') + '\n');
    process.stdout.write(chalk.dim(`        ${this.truncate(verbose.responseBody, 1000)}`) + '\n');

    if (verbose.dynamicVarDetails.length > 0) {
      process.stdout.write(chalk.dim('      Dynamic Variables:') + '\n');
      for (const dv of verbose.dynamicVarDetails) {
        if (dv.extracted) {
          process.stdout.write(
            `        ${chalk.green('✓')} ${chalk.dim(
              `${dv.key} = "${dv.value}" (extracted from ${dv.source}: ${dv.selector})`,
            )}\n`,
          );
        } else {
          process.stdout.write(`        ${chalk.yellow('⚠')} ${chalk.yellow(`${dv.key} — ${dv.error}`)}\n`);
        }
      }
    }
  }

  private truncate(text: string, maxLen: number): string {
    if (text.length <= maxLen) return text;
    return text.slice(0, maxLen) + '… (truncated)';
  }

  private formatDuration(ms: number): string {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  }

  private extractPath(url: string): string {
    try {
      return new URL(url).pathname;
    } catch {
      return url;
    }
  }
}
```

- [ ] **Step 2: Commit.**

```bash
git add cli/reporter/console.ts
git commit -m "feat(cli): reporter header shows project › folder · env"
```

---

### Task 10: Wire the run command (`cli/commands/run.ts`)

**Files:**
- Modify (rewrite): `cli/commands/run.ts`

- [ ] **Step 1: Rewrite `cli/commands/run.ts`** to orchestrate loader → integrity gate → selection → variable store → runner → reporter. The integrity-gate decision lives here because it needs TTY-awareness, `--unsafe`, and user-facing prompts.

```typescript
import { confirm } from '@inquirer/prompts';
import { loadProject } from '../config/projectLoader';
import {
  VariableStore,
  parseVarOverrides,
  filterDynamicVarsForFolder,
} from '../config/variables';
import { resolveSelection } from '../config/selection';
import { SequentialRunner } from '../runner/runner';
import { ConsoleReporter } from '../reporter/console';
import type { IntegrityStatus } from '../../shared/types/project';

export interface RunOptions {
  collection?: string;
  env?: string;
  unsafe?: boolean;
  var?: string[];
  timeout: string;
  stopOnFailure?: boolean;
  color: boolean;
  verbose?: boolean;
}

export async function runCommand(projectFile: string, options: RunOptions): Promise<void> {
  const { file, integrity, filePath } = loadProject(projectFile);

  await enforceIntegrity(integrity, options.unsafe ?? false, options.verbose ?? false);

  const selection = await resolveSelection(file.data.collection, file.data.environments, {
    collectionArg: options.collection,
    envArg: options.env,
  });

  const filteredDvars = filterDynamicVarsForFolder(file.data.dynamicVariables, selection.folder.id);
  const cliOverrides = parseVarOverrides(options.var ?? []);

  const store = new VariableStore(selection.environment, filteredDvars, cliOverrides);

  const reporter = new ConsoleReporter({
    verbose: options.verbose ?? false,
    noColor: !options.color,
  });

  reporter.printHeader({
    projectName: file.data.collection.info.name,
    folderName: selection.folder.name,
    environmentTitle: selection.environment?.title ?? null,
    totalRequests: selection.folder.item.length,
  });

  const runner = new SequentialRunner(
    selection.folder,
    selection.environment,
    {
      stopOnFailure: options.stopOnFailure ?? false,
      timeout: parseInt(options.timeout, 10),
      verbose: options.verbose ?? false,
    },
    store,
  );

  runner.onResult((result, index, total) => reporter.printResult(result, index, total));

  process.on('SIGINT', () => {
    process.stdout.write('\n');
    runner.abort();
    reporter.printSummary(runner.getPartialSummary());
    process.exit(1);
  });

  const result = await runner.run();
  reporter.printSummary(result);

  // Idempotency guarantee: we never touch `filePath` on disk. Asserted by the
  // smoke test, not at runtime. The `filePath` var stays for future diagnostic
  // output under --verbose if we ever want to echo the resolved path.
  void filePath;

  process.exit(result.success ? 0 : 1);
}

async function enforceIntegrity(
  status: IntegrityStatus,
  unsafe: boolean,
  verbose: boolean,
): Promise<void> {
  if (unsafe) return;

  if (status === 'verified') {
    if (verbose) process.stdout.write('Checksum verified.\n');
    return;
  }

  const messages: Record<Exclude<IntegrityStatus, 'verified'>, { prompt: string; ciError: string }> = {
    missing: {
      prompt:
        'No checksum in this project file — it may have been created manually or modified outside Rentgen. Continue?',
      ciError: 'Checksum missing. Pass --unsafe to proceed.',
    },
    modified: {
      prompt:
        'Checksum mismatch — this project file has been modified since it was exported. Continue?',
      ciError: 'Checksum mismatch. Pass --unsafe to proceed.',
    },
  };

  const copy = messages[status];

  if (!process.stdin.isTTY) {
    console.error(copy.ciError);
    process.exit(2);
  }

  const proceed = await confirm({ message: copy.prompt, default: false });
  if (!proceed) {
    console.error('Aborted by user.');
    process.exit(1);
  }
}
```

- [ ] **Step 2: Commit.**

```bash
git add cli/commands/run.ts
git commit -m "feat(cli): wire loader → integrity → selection → runner"
```

---

### Task 11: Update CLI entry (`cli/index.ts`) with new flags

**Files:**
- Modify: `cli/index.ts`

- [ ] **Step 1: Replace `cli/index.ts`** with the new command surface per the spec.

```typescript
#!/usr/bin/env node
import { Command } from 'commander';
import { runCommand } from './commands/run';

const program = new Command();

program
  .name('rentgen')
  .description('Rentgen CLI — run a folder of requests from a .rentgen project export')
  .version('1.0.0');

program
  .command('run')
  .description('Execute a folder of requests from a .rentgen project export')
  .argument('<project-file>', 'Path to a .rentgen / .json project export')
  .option('--collection <name|id>', 'Folder to run (from data.collection.item[])')
  .option('--env <name|id>', 'Environment to use. --env=none runs with no environment.')
  .option('--unsafe', 'Skip checksum confirmation prompt')
  .option('--var <key=value...>', 'Override variables (repeatable, highest priority)')
  .option('--timeout <ms>', 'Per-request timeout in ms', '30000')
  .option('--stop-on-failure', 'Stop after first failed request')
  .option('--no-color', 'Disable colored output')
  .option('--verbose', 'Show full request/response details + unresolved-var warnings')
  .action(runCommand);

program.parse();
```

- [ ] **Step 2: Smoke-compile.**

```bash
npm run dev:cli -- run --help
```

Expected: help text prints, lists `<project-file>`, `--collection`, `--env`, `--unsafe`, etc.

- [ ] **Step 3: Commit.**

```bash
git add cli/index.ts
git commit -m "feat(cli): new flag surface --collection --env --unsafe"
```

---

### Task 12: Remove the "Export CI Bundle" desktop button

**Files:**
- Modify: `src/components/sidebar/colletion/CollectionGroup.tsx`

- [ ] **Step 1: Remove the `ciBundle` import and the `ExportIcon` import.**

In `src/components/sidebar/colletion/CollectionGroup.tsx`, delete line 17:

```typescript
import { generateBundle } from '../../../utils/ciBundle';
```

And delete line 26:

```typescript
import ExportIcon from '../../../assets/icons/export-icon.svg';
```

- [ ] **Step 2: Delete the `handleExportBundle` callback.** Remove lines 117-128:

```typescript
  const handleExportBundle = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      const postmanFolder = collectionData.item.find((f) => f.id === folder.id);
      if (!postmanFolder) return;

      const appVersion = await window.electronAPI.getAppVersion();
      const bundle = generateBundle(postmanFolder, selectedEnvironment, dynamicVariables, appVersion);
      await window.electronAPI.exportCIBundle(bundle);
    },
    [collectionData, folder.id, selectedEnvironment, dynamicVariables],
  );
```

- [ ] **Step 3: Delete the `<ExportIcon>` button in JSX** (lines 215-221):

```tsx
          {folder.items.length > 0 && !isEditing && !isThisFolderRunning && (
            <ExportIcon
              className="h-4 w-4 shrink-0 text-button-text-secondary dark:text-text-secondary hover:text-button-primary cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handleExportBundle}
              title="Export CI Bundle"
            />
          )}
```

- [ ] **Step 4: Remove the now-unused selectors.** Verify whether `selectedEnvironment` and `dynamicVariables` (and their imports / `useAppSelector` calls near lines 12-14, 59-60) are still used anywhere else in this file. Grep within the file:

```bash
grep -n "selectedEnvironment\|dynamicVariables" src/components/sidebar/colletion/CollectionGroup.tsx
```

If the only remaining references are in the `useAppSelector` lines and the now-deleted callback, delete those `useAppSelector` calls AND the matching imports from `../../../store/selectors`. If they're used elsewhere in the component, leave them.

- [ ] **Step 5: Lint + dev-run.**

```bash
npm run lint && npm start
```

Expected: no type errors. In the running app, hover over a folder — the Play / Edit / Delete icons appear, but the export icon is gone. Close the app.

- [ ] **Step 6: Commit.**

```bash
git add src/components/sidebar/colletion/CollectionGroup.tsx
git commit -m "chore: remove Export CI Bundle button"
```

---

### Task 13: Remove CI-bundle IPC handler and preload method

**Files:**
- Modify: `electron/handlers/importExportHandlers.ts`
- Modify: `electron/preload.ts`

- [ ] **Step 1: In `electron/handlers/importExportHandlers.ts`,** remove the `RentgenBundle` import on line 5:

```typescript
import type { RentgenBundle } from '../../shared/types/bundle';
```

Delete the whole `export-ci-bundle` handler block (lines 51-69):

```typescript
  // Export CI bundle
  ipcMain.handle('export-ci-bundle', async (_, bundle: RentgenBundle): Promise<ExportResult> => {
    ...
  });
```

- [ ] **Step 2: In `electron/preload.ts`,** remove the `RentgenBundle` import on line 3:

```typescript
import type { RentgenBundle } from '../shared/types/bundle';
```

Delete line 10 from the `ElectronApi` interface:

```typescript
  exportCIBundle: (bundle: RentgenBundle) => Promise<ExportResult>;
```

Delete line 42 from the `contextBridge.exposeInMainWorld` object:

```typescript
  exportCIBundle: (bundle: RentgenBundle): Promise<ExportResult> => ipcRenderer.invoke('export-ci-bundle', bundle),
```

- [ ] **Step 3: Lint + dev-run.**

```bash
npm run lint && npm start
```

Expected: app launches, Export Project still works. Close.

- [ ] **Step 4: Commit.**

```bash
git add electron/handlers/importExportHandlers.ts electron/preload.ts
git commit -m "chore: remove export-ci-bundle IPC handler and preload method"
```

---

### Task 14: Delete deprecated files

**Files:**
- Delete: `src/utils/ciBundle.ts`
- Delete: `shared/types/bundle.ts`
- Delete: `rentgen.bundle.json` (repo-root example)

- [ ] **Step 1: Confirm nothing still imports them.**

```bash
grep -rn "ciBundle\|RentgenBundle\|BundleRequest\|BundleDynamicVariable\|BundleHeader\|BundleSource\|BundleRunResult\|BundleRequestResult" src/ electron/ cli/ shared/
```

Expected: no matches (or only matches inside the three files about to be deleted).

If there are stragglers, fix them before proceeding.

- [ ] **Step 2: Delete.**

```bash
rm src/utils/ciBundle.ts shared/types/bundle.ts rentgen.bundle.json
```

- [ ] **Step 3: Lint + build the CLI.**

```bash
npm run lint && npm run build:cli
```

Expected: both succeed. `dist/cli/index.js` is produced.

- [ ] **Step 4: Commit.**

```bash
git add -A
git commit -m "chore: delete ciBundle util, bundle types, example bundle"
```

---

### Task 15: End-to-end smoke tests

No test runner exists in this repo (per CLAUDE.md), so this task is a manual checklist mirroring the spec's "Testing approach" section. Run every scenario; record pass/fail.

**Files:** none modified.

- [ ] **Scenario 1 — Happy path (scripted, ambiguous then resolved):**

```bash
npm run dev:cli -- run hudge-example-rentgen-project.rentgen --collection="All Requests" --env=none
```

Expected: exits with code 2, stderr lists two folder IDs starting with `folder_`.

Pick one ID from the output, then re-run:

```bash
npm run dev:cli -- run hudge-example-rentgen-project.rentgen --collection=<folder_id> --env=none
```

Expected: requests fire, per-request lines print, summary prints, exit code reflects pass/fail of the requests (not the CLI machinery).

- [ ] **Scenario 2 — Happy path (interactive):**

```bash
npm run dev:cli -- run hudge-example-rentgen-project.rentgen
```

Expected: arrow-key prompt appears for folder, then for env. After selecting, requests fire.

- [ ] **Scenario 3 — Idempotency:**

Capture the file hash before and after a run.

```bash
shasum -a 256 hudge-example-rentgen-project.rentgen > /tmp/rentgen-before.sha
npm run dev:cli -- run hudge-example-rentgen-project.rentgen --collection=<folder_id> --env=none
shasum -a 256 hudge-example-rentgen-project.rentgen > /tmp/rentgen-after.sha
diff /tmp/rentgen-before.sha /tmp/rentgen-after.sha
```

Expected: `diff` produces no output (the hashes match, the file is byte-identical).

- [ ] **Scenario 4 — Checksum mismatch:**

Make a temp copy, corrupt it, run against it.

```bash
cp hudge-example-rentgen-project.rentgen /tmp/tampered.rentgen
# change one byte in the data section
node -e "const fs=require('fs'); const p='/tmp/tampered.rentgen'; const o=JSON.parse(fs.readFileSync(p,'utf-8')); o.data.environments.push({id:'e_x',title:'x',color:'#000',variables:[]}); fs.writeFileSync(p, JSON.stringify(o,null,2));"
npm run dev:cli -- run /tmp/tampered.rentgen --collection=<folder_id> --env=none
```

Expected: TTY prompt "Checksum mismatch — ... Continue? (y/N)". Choose `N`: exits 1, message "Aborted by user."

Re-run with `--unsafe`:

```bash
npm run dev:cli -- run /tmp/tampered.rentgen --collection=<folder_id> --env=none --unsafe
```

Expected: no prompt, runs through.

- [ ] **Scenario 5 — Non-TTY without flags:**

```bash
npm run dev:cli -- run hudge-example-rentgen-project.rentgen < /dev/null
```

Expected: exit code 2, stderr contains "CI mode detected — pass --collection and --env explicitly."

- [ ] **Scenario 6 — Desktop regression:**

```bash
npm start
```

- Verify: "Export CI Bundle" button is gone from folder rows (hover a folder, see only Play / Edit / Delete).
- Verify: Export Project still produces a `.rentgen` file.
- Verify: Import Project re-imports it with "verified" integrity.

- [ ] **Step: record results and commit any bug fixes.** If scenarios 1-6 all pass, this task is done — no additional commit. If a bug surfaces, fix it and commit as `fix(cli): ...`.

---

## Self-Review Notes

- Every spec section is covered: command surface (Task 11), selection resolution (Task 5), integrity check (Tasks 2, 4, 10), idempotency (Task 6 — never writes, Scenario 3 — verified), unresolved variables (Tasks 6, 9), removed surface (Tasks 12-14), new/changed CLI modules (Tasks 4-11), shared types (Task 1), dependencies (Task 3), error matrix / exit codes (encoded across Tasks 4, 5, 10), testing (Task 15).
- No placeholders. Every implementation step has literal code.
- Type consistency: `RunResult` / `RequestResult` / `VerboseDetails` / `DynamicVarDetail` appear in Tasks 7 and 8 with matching names. `VariableStore` exposes `.update()` (consistent with `update(key, value)` used in Task 8 runner). `substituteRequest` takes `PostmanItem` (Task 6) and the runner calls it with `items[i]` (Task 8). `ResolvedRequest.id` / `.name` carry the item's id/name since `PostmanRequest` has no `id`/`name` itself.
- Order is safe: no task imports a symbol that doesn't exist yet. The moment of maximum breakage is between Task 4 (`loader.ts` deleted) and Task 10 (`run.ts` rewritten to use `projectLoader`). The commit at end of Task 4 will intentionally leave the tree red — that's fine; execution-plan reviewers see the explicit note. If you prefer an always-green tree, squash Tasks 4 and 10 into a single commit at Task 10's end.
