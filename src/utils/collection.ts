import { PostmanCollection, PostmanHeader, PostmanItem, PostmanRequest } from '../types/postman';

const DEFAULT_FOLDER_ID = 'default';
const DEFAULT_FOLDER_NAME = 'default';
const COLLECTION_SCHEMA = 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json';

export interface SidebarItemData {
  id: string;
  method: string;
  url: string;
  name: string;
  folderId: string;
}

export function createEmptyCollection(): PostmanCollection {
  return {
    info: {
      name: 'Rentgen Collection',
      description: 'Saved HTTP requests from Rentgen',
      schema: COLLECTION_SCHEMA,
    },
    item: [
      {
        id: DEFAULT_FOLDER_ID,
        name: DEFAULT_FOLDER_NAME,
        item: [],
      },
    ],
  };
}

export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export function generateRequestName(method: string, url: string): string {
  try {
    const urlObj = new URL(url);
    const path = urlObj.pathname || '/';
    const pathParts = path.split('/').filter(Boolean);
    const lastPart = pathParts[pathParts.length - 1] || 'root';
    return `${method} ${lastPart}`;
  } catch {
    return `${method} request`;
  }
}

export function headersToPostmanFormat(headers: Record<string, string>): PostmanHeader[] {
  return Object.entries(headers).map(([key, value]) => ({ key, value }));
}

export function postmanHeadersToRecord(headers: PostmanHeader[]): Record<string, string> {
  const result: Record<string, string> = {};
  for (const h of headers) {
    result[h.key] = h.value;
  }
  return result;
}

export function headersRecordToString(headers: Record<string, string>): string {
  return Object.entries(headers)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n');
}

export function requestToPostmanItem(
  method: string,
  url: string,
  headers: Record<string, string>,
  body: string | null,
): PostmanItem {
  const request: PostmanRequest = {
    method: method.toUpperCase(),
    url,
    header: headersToPostmanFormat(headers),
  };

  if (body && !['GET', 'HEAD'].includes(method.toUpperCase())) {
    request.body = {
      mode: 'raw',
      raw: body,
    };
  }

  return {
    id: generateRequestId(),
    name: generateRequestName(method, url),
    request,
  };
}

export function isDuplicateRequest(
  collection: PostmanCollection,
  method: string,
  url: string,
  body: string | null,
): boolean {
  for (const folder of collection.item) {
    for (const item of folder.item) {
      const req = item.request;
      if (
        req.method.toUpperCase() === method.toUpperCase() &&
        req.url === url &&
        ((req.body?.raw || null) === (body || null) || (req.body?.raw || '{}') === (body || '{}'))
      ) {
        return true;
      }
    }
  }
  return false;
}

export function addRequestToCollection(
  collection: PostmanCollection,
  method: string,
  url: string,
  headers: Record<string, string>,
  body: string | null,
  folderId: string = DEFAULT_FOLDER_ID,
): PostmanCollection {
  // Find or create folder
  let folder = collection.item.find((f) => f.id === folderId);
  if (!folder) {
    folder = {
      id: folderId,
      name: folderId,
      item: [],
    };
    collection.item.push(folder);
  }

  const newItem = requestToPostmanItem(method, url, headers, body);
  folder.item.push(newItem);

  return { ...collection };
}

export function updateRequestInCollection(
  collection: PostmanCollection,
  requestId: string,
  method: string,
  url: string,
  headers: Record<string, string>,
  body: string | null,
): PostmanCollection {
  const updatedCollection = { ...collection, item: [...collection.item] };

  for (let i = 0; i < updatedCollection.item.length; i++) {
    const folder = updatedCollection.item[i];
    const itemIndex = folder.item.findIndex((item) => item.id === requestId);

    if (itemIndex !== -1) {
      updatedCollection.item[i] = {
        ...folder,
        item: [...folder.item],
      };

      const request: PostmanRequest = {
        method: method.toUpperCase(),
        url,
        header: headersToPostmanFormat(headers),
      };

      if (body && !['GET', 'HEAD'].includes(method.toUpperCase())) {
        request.body = {
          mode: 'raw',
          raw: body,
        };
      }

      updatedCollection.item[i].item[itemIndex] = {
        ...folder.item[itemIndex],
        name: generateRequestName(method, url),
        request,
      };
      return updatedCollection;
    }
  }

  return collection;
}

export function removeRequestFromCollection(collection: PostmanCollection, requestId: string): PostmanCollection {
  for (const folder of collection.item) {
    const index = folder.item.findIndex((item) => item.id === requestId);
    if (index !== -1) {
      folder.item.splice(index, 1);
      break;
    }
  }
  return { ...collection };
}

export function findRequestById(collection: PostmanCollection, requestId: string): PostmanItem | null {
  for (const folder of collection.item) {
    const item = folder.item.find((i) => i.id === requestId);
    if (item) {
      return item;
    }
  }
  return null;
}

export function collectionToSidebarItems(collection: PostmanCollection): SidebarItemData[] {
  const items: SidebarItemData[] = [];
  for (const folder of collection.item) {
    for (const item of folder.item) {
      items.push({
        id: item.id,
        method: item.request.method,
        url: item.request.url,
        name: item.name,
        folderId: folder.id,
      });
    }
  }
  return items;
}

export function reorderRequestInCollection(
  collection: PostmanCollection,
  activeId: string,
  overId: string,
): PostmanCollection {
  const updatedCollection = {
    ...collection,
    item: collection.item.map((folder) => ({
      ...folder,
      item: [...folder.item],
    })),
  };

  for (const folder of updatedCollection.item) {
    const activeIndex = folder.item.findIndex((item) => item.id === activeId);
    const overIndex = folder.item.findIndex((item) => item.id === overId);

    if (activeIndex !== -1 && overIndex !== -1) {
      const [movedItem] = folder.item.splice(activeIndex, 1);
      folder.item.splice(overIndex, 0, movedItem);
      break;
    }
  }

  return updatedCollection;
}
