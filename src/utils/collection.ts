import { PostmanCollection, PostmanFolder, PostmanHeader, PostmanItem, PostmanRequest } from '../types';

const DEFAULT_FOLDER_ID = 'default';
const DEFAULT_FOLDER_NAME = 'All Requests';
const COLLECTION_SCHEMA = 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json';

export interface CollectionItemData {
  id: string;
  method: string;
  url: string;
  name: string;
  folderId: string;
}

export interface CollectionFolderData {
  id: string;
  name: string;
  items: CollectionItemData[];
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
    name: url,
    request,
  };
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
      name: folderId === DEFAULT_FOLDER_ID ? DEFAULT_FOLDER_NAME : folderId,
      item: [],
    };
    collection.item.push(folder);
  }

  const newItem = requestToPostmanItem(method, url, headers, body);
  folder.item.unshift(newItem);

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
    if (item) return item;
  }
  return null;
}

export interface RequestWithFolder {
  folder: PostmanFolder;
  request: PostmanItem;
}

/**
 * Find a request by ID and also return the containing folder.
 * Useful when you need both the request and folder context (e.g., for dynamic variables).
 */
export function findRequestWithFolder(collection: PostmanCollection, requestId: string): RequestWithFolder | null {
  for (const folder of collection.item) {
    const item = folder.item.find((i) => i.id === requestId);
    if (item) {
      return { folder, request: item };
    }
  }
  return null;
}

export function renameRequestInCollection(
  collection: PostmanCollection,
  requestId: string,
  newName: string,
): PostmanCollection {
  const updatedCollection = { ...collection, item: [...collection.item] };
  for (const folder of updatedCollection.item) {
    const index = folder.item.findIndex((item) => item.id === requestId);
    if (index !== -1) {
      folder.item[index] = {
        ...folder.item[index],
        name: newName,
      };
      break;
    }
  }

  return updatedCollection;
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

export function collectionToGroupedSidebarData(collection: PostmanCollection): CollectionFolderData[] {
  return collection.item.map((folder) => ({
    id: folder.id,
    name: folder.id === DEFAULT_FOLDER_ID ? (folder.name ?? DEFAULT_FOLDER_NAME) : folder.name,
    items: folder.item.map((item) => ({
      id: item.id,
      method: item.request.method,
      url: item.request.url,
      name: item.name,
      folderId: folder.id,
    })),
  }));
}

export function generateFolderId(): string {
  return `folder_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export function addFolderToCollection(collection: PostmanCollection, name: string): PostmanCollection {
  const newFolder = {
    id: generateFolderId(),
    name,
    item: [] as PostmanItem[],
  };
  return {
    ...collection,
    item: [newFolder, ...collection.item],
  };
}

export function renameFolderInCollection(
  collection: PostmanCollection,
  folderId: string,
  newName: string,
): PostmanCollection {
  return {
    ...collection,
    item: collection.item.map((folder) => (folder.id === folderId ? { ...folder, name: newName } : folder)),
  };
}

export function removeFolderFromCollection(collection: PostmanCollection, folderId: string): PostmanCollection {
  return {
    ...collection,
    item: collection.item.filter((f) => f.id !== folderId),
  };
}

export function reorderFolderInCollection(
  collection: PostmanCollection,
  activeId: string,
  overId: string,
): PostmanCollection {
  const updatedFolders = [...collection.item];
  const activeIndex = updatedFolders.findIndex((f) => f.id === activeId);
  const overIndex = updatedFolders.findIndex((f) => f.id === overId);

  if (activeIndex !== -1 && overIndex !== -1) {
    const [movedFolder] = updatedFolders.splice(activeIndex, 1);
    updatedFolders.splice(overIndex, 0, movedFolder);
  }

  return {
    ...collection,
    item: updatedFolders,
  };
}

export function findFolderIdByRequestId(collection: PostmanCollection, requestId: string): string | null {
  for (const folder of collection.item) {
    const item = folder.item.find((i) => i.id === requestId);
    if (item) {
      return folder.id;
    }
  }
  return null;
}

export function moveRequestToFolder(
  collection: PostmanCollection,
  requestId: string,
  targetFolderId: string,
  targetIndex?: number,
): PostmanCollection {
  let movedItem: PostmanItem | undefined;
  let sourceFolderId: string | undefined;

  for (const folder of collection.item) {
    const item = folder.item.find((i) => i.id === requestId);
    if (item) {
      movedItem = item;
      sourceFolderId = folder.id;
      break;
    }
  }

  if (!movedItem || !sourceFolderId || sourceFolderId === targetFolderId) {
    return collection;
  }

  const itemToMove = movedItem;

  return {
    ...collection,
    item: collection.item.map((folder) => {
      if (folder.id === sourceFolderId) {
        return {
          ...folder,
          item: folder.item.filter((item) => item.id !== requestId),
        };
      }
      if (folder.id === targetFolderId) {
        const newItems = [...folder.item];
        const insertIndex = targetIndex !== undefined ? targetIndex : newItems.length;
        newItems.splice(insertIndex, 0, itemToMove);
        return { ...folder, item: newItems };
      }
      return folder;
    }),
  };
}
