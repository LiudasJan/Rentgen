import { HttpRequest, Test, TestStatus } from '../types';
import { extractStatusCode } from '../utils';

const NOT_FOUND_TEST_NAME = '404 Not Found';
const NOT_FOUND_TEST_EXPECTED = '404 Not Found';

export async function runNotFoundTest(request: HttpRequest): Promise<Test> {
  const { url } = request;
  let testUrl = url;

  try {
    const parsedUrl = new URL(url);
    // If the URL has query parameters, append NOT_FOUND to the pathname
    parsedUrl.pathname = parsedUrl.pathname.endsWith('/')
      ? `${parsedUrl.pathname}NOT_FOUND`
      : `${parsedUrl.pathname}/NOT_FOUND`;
    testUrl = parsedUrl.toString();
  } catch {
    // Fallback if URL parsing fails
    testUrl = url.endsWith('/') ? `${url}NOT_FOUND` : `${url}/NOT_FOUND`;
  }

  const modifiedRequest: HttpRequest = { ...request, url: testUrl };

  try {
    const startTime = performance.now();
    const response = await window.electronAPI.sendHttp(modifiedRequest);
    const responseTime = performance.now() - startTime;
    const statusCode = extractStatusCode(response);

    return {
      actual: `${statusCode} ${response.status?.split(' ').slice(1).join(' ') || ''}`,
      expected: NOT_FOUND_TEST_EXPECTED,
      name: NOT_FOUND_TEST_NAME,
      request: modifiedRequest,
      response,
      responseTime,
      status: statusCode === 404 ? TestStatus.Pass : statusCode === 0 ? TestStatus.FailNoResponse : TestStatus.Fail,
    };
  } catch (error) {
    return {
      actual: `Unexpected error: ${String(error)}`,
      expected: NOT_FOUND_TEST_EXPECTED,
      name: NOT_FOUND_TEST_NAME,
      request: modifiedRequest,
      response: null,
      responseTime: 0,
      status: TestStatus.Fail,
    };
  }
}
