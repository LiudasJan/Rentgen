import { Test, TestRequest, TestStatus } from '../types';

const CORS_TEST_NAME = 'CORS policy check';
const CORS_TEST_EXPECTED = 'Detect if API is public or private';

export async function runCorsTest(request: TestRequest): Promise<Test> {
  const { url, method, headers, body } = request;
  const modifiedHeaders = { ...headers, Origin: 'https://www.qaontime.com/' };
  const modifiedRequest: TestRequest = { ...request, url, method, headers: modifiedHeaders };

  try {
    if (body && !['GET', 'HEAD'].includes(method.toUpperCase())) modifiedRequest.body = body;
    else delete modifiedRequest.body;

    const requestStartTime = performance.now();
    const response = await window.electronAPI.sendHttp(modifiedRequest);
    const responseTime = performance.now() - requestStartTime;
    const acaoHeader =
      response.headers?.['access-control-allow-origin'] || response.headers?.['Access-Control-Allow-Origin'];

    if (!acaoHeader)
      return {
        actual: 'CORS error → API is private (restricted by origin)',
        expected: CORS_TEST_EXPECTED,
        name: CORS_TEST_NAME,
        request: modifiedRequest,
        response: null,
        responseTime,
        status: TestStatus.Info,
      };

    return {
      actual: 'No CORS error → API is public (accessible from any domain)',
      expected: CORS_TEST_EXPECTED,
      name: CORS_TEST_NAME,
      request: modifiedRequest,
      response,
      responseTime,
      status: TestStatus.Info,
    };
  } catch (error) {
    return {
      actual: `Unexpected error: ${String(error)}`,
      expected: CORS_TEST_EXPECTED,
      name: CORS_TEST_NAME,
      request: modifiedRequest,
      response: null,
      responseTime: 0,
      status: TestStatus.Info,
    };
  }
}
