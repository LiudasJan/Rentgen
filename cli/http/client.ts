import axios, { AxiosError } from 'axios';

export interface HttpRequest {
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: string;
}

export interface HttpResponse {
  status: string;
  statusCode: number;
  headers: Record<string, string>;
  body: string;
  duration: number;
  size: number;
}

export class HttpClient {
  constructor(private timeout: number) {}

  async send(request: HttpRequest): Promise<HttpResponse> {
    const start = performance.now();

    try {
      const response = await axios({
        url: request.url,
        method: request.method.toLowerCase(),
        headers: withJsonContentTypeIfNeeded(request.headers, request.body),
        data: request.body || undefined,
        timeout: this.timeout,
        validateStatus: () => true,
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
        responseType: 'arraybuffer',
      });

      const duration = performance.now() - start;
      const body = Buffer.from(response.data).toString('utf-8');

      return {
        status: `${response.status} ${response.statusText}`,
        statusCode: response.status,
        headers: response.headers as Record<string, string>,
        body,
        duration: Math.round(duration),
        size: Buffer.byteLength(body, 'utf-8'),
      };
    } catch (error) {
      throw new HttpClientError(this.classifyError(error, request));
    }
  }

  private classifyError(error: unknown, request: HttpRequest): string {
    if (!(error instanceof AxiosError)) {
      return String(error);
    }

    if (error.code === 'ECONNABORTED' || error.code === 'ERR_CANCELED') {
      return `Request timeout after ${this.timeout}ms\n  ${request.method} ${request.url}\n  Increase timeout with --timeout <ms>`;
    }

    if (error.code === 'ECONNREFUSED') {
      return `Connection refused: ${request.url}\n  Make sure the server is running and accessible`;
    }

    if (error.code === 'ENOTFOUND') {
      return `DNS resolution failed: ${request.url}\n  Check the hostname and your network connection`;
    }

    if (error.code === 'CERT_HAS_EXPIRED' || error.code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE' || error.code === 'ERR_TLS_CERT_ALTNAME_INVALID') {
      return `SSL certificate error: ${error.message}\n  The server's SSL certificate could not be verified`;
    }

    if (error.code === 'ECONNRESET') {
      return `Connection reset by server: ${request.url}`;
    }

    return error.message || String(error);
  }
}

export class HttpClientError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'HttpClientError';
  }
}

// Mirrors the desktop UI's parseBody → axios flow: when the user did not set a
// Content-Type and the body parses as a JSON object/array, send it as JSON.
// Without this, axios falls back to `application/x-www-form-urlencoded` for
// raw string bodies, which makes JSON APIs return 500.
function withJsonContentTypeIfNeeded(
  headers: Record<string, string>,
  body: string | undefined,
): Record<string, string> {
  if (!body) return headers;
  if (Object.keys(headers).some((k) => k.toLowerCase() === 'content-type')) return headers;

  try {
    const parsed = JSON.parse(body);
    if (parsed === null || typeof parsed !== 'object') return headers;
  } catch {
    return headers;
  }

  return { ...headers, 'Content-Type': 'application/json' };
}
