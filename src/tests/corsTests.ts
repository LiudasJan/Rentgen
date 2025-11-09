import { Method } from 'axios';

export async function runCorsTest(method: Method, url: string, headers: any, body: string): Promise<any> {
  try {
    const options: RequestInit = {
      method,
      mode: 'cors',
      headers,
    };
    if (body && !['GET', 'HEAD'].includes(method.toUpperCase())) options.body = body;

    const { status } = await fetch(url, options);

    return {
      name: 'CORS policy check',
      expected: 'Detect if API is public or private',
      actual: 'No CORS error → API is public (accessible from any domain)',
      status: '🔵 Info',
      request: { url, method, headers, body },
      response: { status },
    };
  } catch (error) {
    const message = String(error?.message || error);
    if (message.includes('CORS') || message.includes('Failed to fetch'))
      return {
        name: 'CORS policy check',
        expected: 'Detect if API is public or private',
        actual: 'CORS error → API is private (restricted by origin)',
        status: '🔵 Info',
        request: { url, method, headers, body },
        response: null,
      };

    return {
      name: 'CORS policy check',
      expected: 'Detect if API is public or private',
      actual: 'Unexpected error: ' + message,
      status: '🔵 Info',
      request: { url, method, headers, body },
      response: null,
    };
  }
}
