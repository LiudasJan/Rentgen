import type { RentgenBundle, BundleRequest, BundleDynamicVariable } from '../../shared/types/bundle';
import type { PostmanFolder } from '../types/postman';
import type { DynamicVariable, Environment } from '../types/environment';

export function generateBundle(
  folder: PostmanFolder,
  selectedEnvironment: Environment | null,
  dynamicVariables: DynamicVariable[],
  appVersion: string,
): RentgenBundle {
  const folderRequestIds = new Set(folder.item.map((item) => item.id));

  const requests: BundleRequest[] = folder.item.map((item, index) => ({
    id: item.id,
    name: item.name,
    method: item.request.method,
    url: item.request.url,
    headers: item.request.header.map((h) => ({ key: h.key, value: h.value })),
    body: item.request.body?.raw,
    order: index,
  }));

  const variables: Record<string, string> = {};
  if (selectedEnvironment) {
    for (const v of selectedEnvironment.variables) {
      variables[v.key] = v.value;
    }
  }

  const bundleDynamicVars: BundleDynamicVariable[] = dynamicVariables
    .filter((dv) => folderRequestIds.has(dv.requestId))
    .map((dv) => ({
      id: dv.id,
      key: dv.key,
      selector: dv.selector,
      source: dv.source,
      requestId: dv.requestId,
      initialValue: dv.currentValue,
    }));

  return {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    exportedBy: `Rentgen Desktop v${appVersion}`,
    source: {
      folderName: folder.name,
      folderId: folder.id,
      totalRequests: folder.item.length,
    },
    requests,
    variables,
    dynamicVariables: bundleDynamicVars,
  };
}
