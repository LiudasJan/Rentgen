// Postman Collection Full Format Types (for import/export)
// Supports Postman Collection v2.1.0 schema

export interface PostmanUrlObject {
  raw: string;
  protocol?: string;
  host?: string[];
  path?: string[];
  query?: PostmanQueryParam[];
  variable?: PostmanVariable[];
}

export interface PostmanQueryParam {
  key: string;
  value: string;
  disabled?: boolean;
  description?: string;
}

export interface PostmanVariable {
  key: string;
  value: string;
  type?: string;
  description?: string;
}

export interface PostmanHeaderFull {
  key: string;
  value: string;
  type?: string; // Usually "text"
  disabled?: boolean;
  description?: string;
}

export interface PostmanBodyFull {
  mode: 'raw' | 'formdata' | 'urlencoded' | 'file' | 'graphql';
  raw?: string;
  formdata?: PostmanFormDataItem[];
  urlencoded?: PostmanUrlencodedItem[];
  options?: {
    raw?: { language: string }; // "json", "xml", "text", etc.
  };
}

export interface PostmanFormDataItem {
  key: string;
  value?: string;
  type?: 'text' | 'file';
  src?: string;
  disabled?: boolean;
}

export interface PostmanUrlencodedItem {
  key: string;
  value: string;
  disabled?: boolean;
  description?: string;
}

export interface PostmanAuth {
  type: 'bearer' | 'basic' | 'apikey' | 'oauth2' | 'noauth' | string;
  bearer?: { key: string; value: string }[];
  basic?: { key: string; value: string }[];
  apikey?: { key: string; value: string }[];
}

export interface PostmanEvent {
  listen: 'prerequest' | 'test';
  script: {
    type: string;
    exec: string[];
  };
}

export interface PostmanRequestFull {
  method: string;
  url: string | PostmanUrlObject;
  header?: PostmanHeaderFull[];
  body?: PostmanBodyFull;
  auth?: PostmanAuth;
  description?: string;
}

// Postman item can be a request OR a folder (recursive)
export interface PostmanItemFull {
  name: string;
  _postman_id?: string;
  request: PostmanRequestFull;
  response?: unknown[];
  event?: PostmanEvent[];
}

export interface PostmanFolderFull {
  name: string;
  _postman_id?: string;
  item: (PostmanItemFull | PostmanFolderFull)[];
  auth?: PostmanAuth;
  event?: PostmanEvent[];
  description?: string;
}

export interface PostmanCollectionInfoFull {
  _postman_id?: string;
  name: string;
  description?: string;
  schema: string;
}

export interface PostmanCollectionFull {
  info: PostmanCollectionInfoFull;
  item: (PostmanItemFull | PostmanFolderFull)[];
  auth?: PostmanAuth;
  variable?: PostmanVariable[];
  event?: PostmanEvent[];
}

// Type guard: check if item is a folder (has nested items, no request)
export function isPostmanFolder(item: PostmanItemFull | PostmanFolderFull): item is PostmanFolderFull {
  return 'item' in item && !('request' in item);
}

// Type guard: check if item is a request
export function isPostmanRequest(item: PostmanItemFull | PostmanFolderFull): item is PostmanItemFull {
  return 'request' in item;
}
