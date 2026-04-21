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
        headers: request.headers,
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
