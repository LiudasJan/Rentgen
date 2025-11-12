import { Method } from 'axios';
import { Test, TestStatus } from '../types';

export async function runCorsTest(
  method: Method,
  url: string,
  headers: Record<string, string>,
  body: string,
): Promise<Test> {
  try {
    const options: RequestInit = {
      method,
      mode: 'cors',
      headers,
    };
    if (body && !['GET', 'HEAD'].includes(method.toUpperCase())) options.body = body;

    const { status } = await fetch(url, options);

    return {
      actual: 'No CORS error → API is public (accessible from any domain)',
      expected: 'Detect if API is public or private',
      name: 'CORS policy check',
      request: { url, method, headers, body },
      response: { status },
      status: TestStatus.Info,
    };
  } catch (error) {
    const message = String(error?.message || error);

    return {
      actual:
        message.includes('CORS') || message.includes('Failed to fetch')
          ? 'CORS error → API is private (restricted by origin)'
          : 'Unexpected error: ' + message,
      expected: 'Detect if API is public or private',
      name: 'CORS policy check',
      request: { url, method, headers, body },
      response: null,
      status: TestStatus.Info,
    };
  }
}
