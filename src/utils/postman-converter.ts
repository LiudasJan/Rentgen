import { v4 as uuidv4 } from 'uuid';
import {
  PostmanCollection,
  PostmanFolder,
  PostmanItem,
  PostmanHeader,
  PostmanBody,
  PostmanRequest,
  PostmanCollectionFull,
  PostmanFolderFull,
  PostmanItemFull,
  PostmanUrlObject,
  PostmanHeaderFull,
  PostmanBodyFull,
  PostmanRequestFull,
  isPostmanFolder,
  isPostmanRequest,
} from '../types';
import { generateRequestId, generateFolderId } from './collection';

const COLLECTION_SCHEMA = 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json';

// ============================================
// EXPORT: Rentgen -> Postman
// ============================================

/**
 * Convert Rentgen collection to full Postman-compatible format
 */
export function rentgenToPostman(collection: PostmanCollection): PostmanCollectionFull {
  return {
    info: {
      _postman_id: uuidv4(),
      name: collection.info.name,
      description: collection.info.description || '',
      schema: COLLECTION_SCHEMA,
    },
    item: collection.item.map((folder) => convertFolderToPostman(folder)),
  };
}

function convertFolderToPostman(folder: PostmanFolder): PostmanFolderFull {
  return {
    name: folder.name,
    _postman_id: folder.id || uuidv4(),
    item: folder.item.map((item) => convertItemToPostman(item)),
  };
}

function convertItemToPostman(item: PostmanItem): PostmanItemFull {
  return {
    name: item.name,
    _postman_id: item.id || uuidv4(),
    request: convertRequestToPostman(item.request),
    response: [],
  };
}

function convertRequestToPostman(request: PostmanRequest): PostmanRequestFull {
  return {
    method: request.method,
    url: urlToPostmanObject(request.url),
    header: request.header.map((h) => ({
      key: h.key,
      value: h.value,
      type: 'text',
      disabled: false,
    })),
    body: request.body ? convertBodyToPostman(request.body) : undefined,
  };
}

function convertBodyToPostman(body: PostmanBody): PostmanBodyFull {
  const result: PostmanBodyFull = {
    mode: body.mode,
  };

  if (body.mode === 'raw' && body.raw) {
    result.raw = body.raw;
    result.options = {
      raw: { language: detectLanguage(body.raw) },
    };
  }

  return result;
}

/**
 * Parse URL string into Postman URL object
 */
export function urlToPostmanObject(urlString: string): PostmanUrlObject {
  try {
    const url = new URL(urlString);

    return {
      raw: urlString,
      protocol: url.protocol.replace(':', ''),
      host: url.hostname.split('.'),
      path: url.pathname.split('/').filter(Boolean),
      query: Array.from(url.searchParams.entries()).map(([key, value]) => ({
        key,
        value,
      })),
    };
  } catch {
    // Invalid URL, return as-is
    return { raw: urlString };
  }
}

function detectLanguage(content: string): string {
  const trimmed = content.trim();
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) return 'json';
  if (trimmed.startsWith('<')) return 'xml';
  return 'text';
}

// ============================================
// IMPORT: Postman -> Rentgen
// ============================================

export interface ImportResult {
  collection: PostmanCollection;
  warnings: string[];
}

/**
 * Convert Postman collection to Rentgen format
 */
export function postmanToRentgen(postmanCollection: PostmanCollectionFull): ImportResult {
  const warnings: string[] = [];

  // Check for unsupported features
  if (postmanCollection.auth) {
    warnings.push('Collection-level authentication was ignored');
  }
  if (postmanCollection.variable?.length) {
    warnings.push(`${postmanCollection.variable.length} collection variables were ignored`);
  }
  if (postmanCollection.event?.length) {
    warnings.push('Collection-level scripts were ignored');
  }

  // Flatten nested folders and convert items
  const { folders, orphanRequests, nestedWarnings } = flattenNestedItems(postmanCollection.item, '');

  warnings.push(...nestedWarnings);

  // If there are orphan requests (items not in folders), create default folder
  const allFolders = [...folders];
  if (orphanRequests.length > 0) {
    allFolders.unshift({
      id: 'default',
      name: 'All Requests',
      item: orphanRequests,
    });
  }

  // Ensure at least one folder exists
  if (allFolders.length === 0) {
    allFolders.push({
      id: 'default',
      name: 'All Requests',
      item: [],
    });
  }

  return {
    collection: {
      info: {
        name: postmanCollection.info.name || 'Imported Collection',
        description: postmanCollection.info.description || '',
        schema: COLLECTION_SCHEMA,
      },
      item: allFolders,
    },
    warnings,
  };
}

interface FlattenResult {
  folders: PostmanFolder[];
  orphanRequests: PostmanItem[];
  nestedWarnings: string[];
}

/**
 * Flatten nested Postman folder structure to single-level folders
 * Nested folders become "Parent / Child" named folders
 */
function flattenNestedItems(items: (PostmanItemFull | PostmanFolderFull)[], parentPath: string): FlattenResult {
  const folders: PostmanFolder[] = [];
  const orphanRequests: PostmanItem[] = [];
  const nestedWarnings: string[] = [];

  for (const item of items) {
    if (isPostmanFolder(item)) {
      // It's a folder
      const folderName = parentPath ? `${parentPath} / ${item.name}` : item.name;

      if (item.event?.length) {
        nestedWarnings.push(`Folder "${folderName}" scripts were ignored`);
      }
      if (item.auth) {
        nestedWarnings.push(`Folder "${folderName}" auth was ignored`);
      }

      // Recursively process nested items
      const nested = flattenNestedItems(item.item, folderName);

      // Add nested folders
      folders.push(...nested.folders);
      nestedWarnings.push(...nested.nestedWarnings);

      // Create folder for direct request children
      const directRequests = item.item.filter(isPostmanRequest);
      if (directRequests.length > 0) {
        folders.push({
          id: item._postman_id || generateFolderId(),
          name: folderName,
          item: directRequests.map((req) => convertPostmanItemToRentgen(req, nestedWarnings)),
        });
      }

      // Handle orphan requests from nested
      if (nested.orphanRequests.length > 0 && parentPath === '') {
        // Add orphans to a folder with this name
        const existingFolder = folders.find((f) => f.name === folderName);
        if (existingFolder) {
          existingFolder.item.push(...nested.orphanRequests);
        } else {
          folders.push({
            id: generateFolderId(),
            name: folderName,
            item: nested.orphanRequests,
          });
        }
      }
    } else if (isPostmanRequest(item)) {
      // It's a request at root level
      if (parentPath === '') {
        orphanRequests.push(convertPostmanItemToRentgen(item, nestedWarnings));
      }
    }
  }

  return { folders, orphanRequests, nestedWarnings };
}

function convertPostmanItemToRentgen(item: PostmanItemFull, warnings: string[]): PostmanItem {
  if (item.event?.length) {
    warnings.push(`Request "${item.name}" scripts were ignored`);
  }

  return {
    id: item._postman_id || generateRequestId(),
    name: item.name,
    request: convertPostmanRequestToRentgen(item.request),
  };
}

function convertPostmanRequestToRentgen(request: PostmanRequestFull): PostmanRequest {
  return {
    method: request.method?.toUpperCase() || 'GET',
    url: postmanUrlToString(request.url),
    header: convertPostmanHeaders(request.header || []),
    body: request.body ? convertPostmanBody(request.body) : undefined,
  };
}

/**
 * Convert Postman URL (string or object) to string
 */
export function postmanUrlToString(url: string | PostmanUrlObject | undefined): string {
  if (!url) return '';
  if (typeof url === 'string') return url;

  // Use raw if available
  if (url.raw) return url.raw;

  // Reconstruct from parts
  const protocol = url.protocol || 'https';
  const host = url.host?.join('.') || 'localhost';
  const path = url.path?.length ? '/' + url.path.join('/') : '';
  const query = url.query?.length
    ? '?' +
      url.query
        .filter((q) => !q.disabled)
        .map((q) => `${encodeURIComponent(q.key)}=${encodeURIComponent(q.value)}`)
        .join('&')
    : '';

  return `${protocol}://${host}${path}${query}`;
}

function convertPostmanHeaders(headers: PostmanHeaderFull[]): PostmanHeader[] {
  return headers
    .filter((h) => !h.disabled) // Filter out disabled headers
    .map((h) => ({
      key: h.key,
      value: h.value,
    }));
}

function convertPostmanBody(body: PostmanBodyFull): PostmanBody | undefined {
  if (body.mode === 'raw' && body.raw) {
    return {
      mode: 'raw',
      raw: body.raw,
    };
  }

  if (body.mode === 'urlencoded' && body.urlencoded) {
    // Convert urlencoded to raw JSON representation
    const data = body.urlencoded
      .filter((item) => !item.disabled)
      .reduce(
        (acc, item) => {
          acc[item.key] = item.value;
          return acc;
        },
        {} as Record<string, string>,
      );

    return {
      mode: 'urlencoded',
      raw: new URLSearchParams(data).toString(),
    };
  }

  if (body.mode === 'formdata' && body.formdata) {
    // Convert formdata to displayable format
    const data = body.formdata
      .filter((item) => !item.disabled && item.type !== 'file')
      .reduce(
        (acc, item) => {
          acc[item.key] = item.value || '';
          return acc;
        },
        {} as Record<string, string>,
      );

    return {
      mode: 'formdata',
      raw: JSON.stringify(data, null, 2),
    };
  }

  return undefined;
}

// ============================================
// VALIDATION
// ============================================

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate that a JSON object is a valid Postman collection
 */
export function validatePostmanCollection(obj: unknown): ValidationResult {
  if (!obj || typeof obj !== 'object') {
    return { valid: false, error: 'Invalid JSON object' };
  }

  const collection = obj as Record<string, unknown>;

  if (!collection.info || typeof collection.info !== 'object') {
    return { valid: false, error: 'Missing or invalid "info" field' };
  }

  const info = collection.info as Record<string, unknown>;

  if (typeof info.name !== 'string') {
    return { valid: false, error: 'Missing collection name in info' };
  }

  if (typeof info.schema !== 'string' || !info.schema.includes('postman')) {
    return { valid: false, error: 'Invalid or missing Postman schema URL' };
  }

  if (!Array.isArray(collection.item)) {
    return { valid: false, error: 'Missing or invalid "item" array' };
  }

  return { valid: true };
}
