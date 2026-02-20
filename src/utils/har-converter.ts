import type { HarFile , PostmanCollection, PostmanFolder, PostmanItem, PostmanHeader } from '../types';
import { generateFolderId, generateRequestId } from './collection';

const STATIC_EXTENSIONS = [
  '.css',
  '.js',
  '.woff',
  '.woff2',
  '.ttf',
  '.eot',
  '.otf',
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.svg',
  '.ico',
  '.webp',
  '.avif',
  '.map',
];
const SKIP_URL_PREFIXES = ['data:', 'chrome-extension:', 'chrome:', 'moz-extension:', 'about:'];
const HTTP2_PSEUDO_HEADERS = [':method', ':authority', ':scheme', ':path', ':status'];

export interface HarConversionResult {
  collection: PostmanCollection;
  warnings: string[];
}

export function validateHarFile(obj: unknown): { valid: true } | { valid: false; error: string } {
  if (!obj || typeof obj !== 'object') {
    return { valid: false, error: 'Input is not a valid object' };
  }

  const har = obj as Record<string, unknown>;

  if (!har.log || typeof har.log !== 'object') {
    return { valid: false, error: 'Missing "log" property — not a valid HAR file' };
  }

  const log = har.log as Record<string, unknown>;

  if (!Array.isArray(log.entries)) {
    return { valid: false, error: 'Missing "log.entries" array — not a valid HAR file' };
  }

  if (log.entries.length === 0) {
    return { valid: false, error: 'HAR file contains no entries' };
  }

  for (let i = 0; i < log.entries.length; i++) {
    const entry = log.entries[i] as Record<string, unknown>;
    if (!entry.request || typeof entry.request !== 'object') {
      return { valid: false, error: `Entry ${i} is missing a "request" object` };
    }
    const request = entry.request as Record<string, unknown>;
    if (typeof request.method !== 'string' || typeof request.url !== 'string') {
      return { valid: false, error: `Entry ${i} is missing "method" or "url"` };
    }
  }

  return { valid: true };
}

function isStaticAsset(url: string): boolean {
  try {
    const pathname = new URL(url).pathname.toLowerCase();
    return STATIC_EXTENSIONS.some((ext) => pathname.endsWith(ext));
  } catch {
    return false;
  }
}

function shouldSkipUrl(url: string): boolean {
  const lower = url.toLowerCase();
  return SKIP_URL_PREFIXES.some((prefix) => lower.startsWith(prefix));
}

function getHostname(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return 'unknown';
  }
}

function getPathname(url: string): string {
  try {
    return new URL(url).pathname;
  } catch {
    return url;
  }
}

export function harToRentgen(har: HarFile): HarConversionResult {
  const warnings: string[] = [];
  const folderMap = new Map<string, PostmanItem[]>();
  const seenKeys = new Set<string>();

  let skippedStatic = 0;
  let skippedPreflight = 0;
  const skippedBinary = 0;
  let skippedWebSocket = 0;

  for (const entry of har.log.entries) {
    const { request } = entry;
    const { method, url } = request;

    // Skip non-HTTP URLs
    if (shouldSkipUrl(url)) continue;

    // Skip WebSocket upgrade entries
    if (url.startsWith('ws:') || url.startsWith('wss:')) {
      skippedWebSocket++;
      continue;
    }

    // Skip static assets
    if (isStaticAsset(url)) {
      skippedStatic++;
      continue;
    }

    // Skip OPTIONS preflight requests
    if (method.toUpperCase() === 'OPTIONS') {
      skippedPreflight++;
      continue;
    }

    // Deduplicate by URL+Method
    const dedupeKey = `${method.toUpperCase()}|${url}`;
    if (seenKeys.has(dedupeKey)) continue;
    seenKeys.add(dedupeKey);

    // Convert headers, filtering out HTTP/2 pseudo-headers
    const headers: PostmanHeader[] = (request.headers || [])
      .filter((h) => !HTTP2_PSEUDO_HEADERS.includes(h.name.toLowerCase()))
      .map((h) => ({ key: h.name, value: h.value }));

    // Build request body
    let body: { mode: 'raw'; raw: string } | undefined;
    if (request.postData?.text) {
      body = { mode: 'raw', raw: request.postData.text };
    }

    const item: PostmanItem = {
      id: generateRequestId(),
      name: `${method.toUpperCase()} ${getPathname(url)}`,
      request: {
        method: method.toUpperCase(),
        url,
        header: headers,
        ...(body ? { body } : {}),
      },
    };

    // Group by hostname
    const hostname = getHostname(url);
    const existing = folderMap.get(hostname);
    if (existing) {
      existing.push(item);
    } else {
      folderMap.set(hostname, [item]);
    }
  }

  // Build folders
  const folders: PostmanFolder[] = [];
  for (const [hostname, items] of folderMap) {
    folders.push({
      id: generateFolderId(),
      name: hostname,
      item: items,
    });
  }

  // Build warnings
  if (skippedStatic > 0) warnings.push(`Skipped ${skippedStatic} static asset(s)`);
  if (skippedPreflight > 0) warnings.push(`Skipped ${skippedPreflight} OPTIONS preflight(s)`);
  if (skippedBinary > 0) warnings.push(`Skipped ${skippedBinary} binary body request(s)`);
  if (skippedWebSocket > 0) warnings.push(`Skipped ${skippedWebSocket} WebSocket entry(ies)`);

  const collection: PostmanCollection = {
    info: {
      name: 'HAR Import',
      description: 'Imported from HAR file',
      schema: 'rentgen',
    },
    item: folders,
  };

  return { collection, warnings };
}
