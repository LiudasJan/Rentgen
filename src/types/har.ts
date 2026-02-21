export interface HarNameValue {
  name: string;
  value: string;
}

export interface HarPostData {
  mimeType: string;
  text?: string;
}

export interface HarRequest {
  method: string;
  url: string;
  headers: HarNameValue[];
  postData?: HarPostData;
}

export interface HarResponse {
  status: number;
  statusText: string;
  headers: HarNameValue[];
}

export interface HarEntry {
  request: HarRequest;
  response: HarResponse;
}

export interface HarLog {
  entries: HarEntry[];
}

export interface HarFile {
  log: HarLog;
}
