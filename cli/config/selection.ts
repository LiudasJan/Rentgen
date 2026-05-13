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
      description: `${f.item.length} request${f.item.length === 1 ? '' : 's'}`,
    })),
  });
}

function lookupFolderByArg(folders: PostmanFolder[], arg: string): PostmanFolder {
  const byId = folders.find((f) => f.id === arg);
  if (byId) return byId;

  const byName = folders.filter((f) => f.name === arg);
  if (byName.length === 1) return byName[0];

  if (byName.length > 1) {
    console.error(`Multiple folders match '${arg}'.`);
    console.error('Rename one of the duplicate folders inside Rentgen to disambiguate.');
    process.exit(2);
  }

  console.error(`No folder matches '${arg}'. Available folders:`);
  for (const f of folders) console.error(`  ${f.name}`);
  process.exit(2);
}

async function resolveEnvironment(
  environments: Environment[],
  arg: string | undefined,
): Promise<Environment | null> {
  if (arg !== undefined && arg.toLowerCase() === NONE_SENTINEL) {
    return null;
  }

  if (environments.length === 0) {
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
    console.error(`Multiple environments match '${arg}'.`);
    console.error('Rename one of the duplicate environments inside Rentgen to disambiguate.');
    process.exit(2);
  }

  console.error(`No environment matches '${arg}'. Available:`);
  console.error('  none  (run with no environment)');
  for (const e of environments) console.error(`  ${e.title}`);
  process.exit(2);
}
