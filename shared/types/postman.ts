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
