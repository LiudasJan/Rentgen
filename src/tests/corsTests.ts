import { Method } from 'axios';
import { Test, TestStatus } from '../types';
import { tryParseJsonObject } from '../utils';

const CORS_TEST_NAME = 'CORS policy check';
const CORS_TEST_EXPECTED = 'Detect if API is public or private';

export async function runCorsTest(
  method: Method,
  url: string,
  headers: Record<string, string>,
  body: string,
): Promise<Test> {
  const preflightHeaders = { ...headers, Origin: 'http://rentgen.io' };
  const request: any = {
    url,
    method,
    headers: preflightHeaders,
  };

  try {
    if (body && !['GET', 'HEAD'].includes(method.toUpperCase())) request.body = tryParseJsonObject(body);

    const response = await window.electronAPI.sendHttp(request);
    const acaoHeader =
      response.headers?.['access-control-allow-origin'] || response.headers?.['Access-Control-Allow-Origin'];

    if (!acaoHeader)
      return {
        actual: 'CORS error → API is private (restricted by origin)',
        expected: CORS_TEST_EXPECTED,
        name: CORS_TEST_NAME,
        request,
        response: null,
        status: TestStatus.Info,
      };

    return {
      actual:
        acaoHeader === '*'
          ? 'No CORS error → API is public (accessible from any domain)'
          : `No CORS error → API is public (accessible from specific domain(s): ${acaoHeader})`,
      expected: CORS_TEST_EXPECTED,
      name: CORS_TEST_NAME,
      request,
      response,
      status: TestStatus.Info,
    };
  } catch (error) {
    return {
      actual: `Unexpected error: ${String(error)}`,
      expected: CORS_TEST_EXPECTED,
      name: CORS_TEST_NAME,
      request,
      response: null,
      status: TestStatus.Info,
    };
  }
}
