import { Method } from 'axios';
import { HttpRequest, TestOptions, TestResult, TestStatus } from '../types';
import {
  createHttpRequest,
  createTestHttpRequest,
  extractBodyFromResponse,
  extractStatusCode,
  getHeaderValue,
} from '../utils';

const AUTHORIZATION_TEST_NAME = 'Missing authorization cookie/token';
const AUTHORIZATION_TEST_EXPECTED = 'Should return 401 Unauthorized';
const CORS_TEST_NAME = 'CORS policy check';
const CORS_TEST_EXPECTED = 'Detect if API is public or private';
const CRUD_TEST_NAME = 'CRUD';
const CRUD_TEST_EXPECTED = 'Discover via OPTIONS';
const NOT_FOUND_TEST_NAME = '404 Not Found';
const NOT_FOUND_TEST_EXPECTED = '404 Not Found';
const NOT_AVAILABLE_TEST = 'Not available';

const LARGE_PAYLOAD_SIZE_MB = 10;
const LARGE_PAYLOAD_SIZE_BYTES = LARGE_PAYLOAD_SIZE_MB * 1024 * 1024;
const EXPECTED_PAYLOAD_TOO_LARGE_STATUS = 413;
const EXPECTED_UNAUTHORIZED_STATUS = 401;
const EXPECTED_METHOD_NOT_ALLOWED_STATUS = 405;
const EXPECTED_NOT_IMPLEMENTED_STATUS = 501;
const ACCEPTABLE_OPTIONS_STATUS_CODES = [200, 204];

export async function runSecurityTests(options: TestOptions): Promise<{
  securityTestResults: TestResult[];
  crudTestResults: TestResult[];
}> {
  const securityTestResults: TestResult[] = [];
  const crudTestResults: TestResult[] = [];
  const request = createTestHttpRequest(options);
  const { headers, url } = request;

  try {
    const response = await window.electronAPI.sendHttp(request);

    // Run all header-based security tests
    securityTestResults.push(
      testServerHeaderSecurity(request, response),
      testClickjackingProtection(request, response),
      testHSTS(request, response),
      testMimeSniffing(request, response),
      testCacheControl(request, response),
    );

    // Test OPTIONS method and get CRUD results
    const { test, allowHeader } = await testOptionsMethod(options);
    securityTestResults.push(test);

    if (test.status === TestStatus.Pass)
      crudTestResults.push(...getCrudTestResults(allowHeader, headers, url, response));
    else
      crudTestResults.push(
        createSecurityTestResult(
          CRUD_TEST_NAME,
          CRUD_TEST_EXPECTED,
          'CRUD not available — OPTIONS test failed',
          TestStatus.Fail,
        ),
      );
  } catch (error) {
    securityTestResults.push(
      createSecurityTestResult(
        'Security test error',
        'Should respond',
        `Unexpected error: ${String(error)}`,
        TestStatus.Bug,
      ),
    );
  }

  // Run tests that don't depend on initial response
  securityTestResults.push(
    await testUnsupportedMethod(options),
    await testLargePayload(options),
    await testMissingAuthorization(options),
    await testCors(options),
    await testNotFound(options),
    ...getManualTests(),
  );

  return { securityTestResults, crudTestResults };
}

function testServerHeaderSecurity(request: HttpRequest, response: any): TestResult {
  const serverHeader = getHeaderValue(response.headers, 'server');

  return createSecurityTestResult(
    'No sensitive server headers',
    'Server header should not expose version',
    serverHeader || 'No Server header',
    /\d/.test(serverHeader) ? TestStatus.Fail : TestStatus.Pass,
    request,
    response,
  );
}

function testClickjackingProtection(request: HttpRequest, response: any): TestResult {
  const xFrameOptions = getHeaderValue(response.headers, 'x-frame-options');
  const contentSecurityPolicy = getHeaderValue(response.headers, 'content-security-policy');
  const { actual, status } = validateClickjackingProtection(xFrameOptions, contentSecurityPolicy);

  return createSecurityTestResult(
    'Clickjacking protection',
    'X-Frame-Options DENY/SAMEORIGIN or CSP frame-ancestors',
    actual,
    status,
    request,
    response,
  );
}

function testHSTS(request: HttpRequest, response: any): TestResult {
  const hsts = getHeaderValue(response.headers, 'strict-transport-security');

  return createSecurityTestResult(
    'HSTS (Strict-Transport-Security)',
    'Header should be present on HTTPS endpoints',
    hsts || 'Missing',
    hsts ? TestStatus.Pass : TestStatus.Warning,
    request,
    response,
  );
}

function testMimeSniffing(request: HttpRequest, response: any): TestResult {
  const xContentTypeOptions = getHeaderValue(response.headers, 'x-content-type-options');
  const { actual, status } = validateMimeSniffing(xContentTypeOptions);

  return createSecurityTestResult(
    'MIME sniffing protection',
    'X-Content-Type-Options: nosniff',
    actual,
    status,
    request,
    response,
  );
}

function testCacheControl(request: HttpRequest, response: any): TestResult {
  const cacheControl = getHeaderValue(response.headers, 'cache-control');
  const { actual, status } = validateCacheControl(cacheControl, request.method);

  return createSecurityTestResult(
    'Cache-Control for private API',
    'Cache-Control: no-store/private',
    actual,
    status,
    request,
    response,
  );
}

async function testOptionsMethod(options: TestOptions): Promise<{ test: TestResult; allowHeader: string }> {
  const request = createTestHttpRequest(options);
  const modifiedRequest: HttpRequest = { url: request.url, method: 'OPTIONS', headers: request.headers };
  const response = await window.electronAPI.sendHttp(modifiedRequest);
  const statusCode = extractStatusCode(response);
  const allowHeader =
    getHeaderValue(response.headers, 'allow') || getHeaderValue(response.headers, 'access-control-allow-methods');
  const isValid = ACCEPTABLE_OPTIONS_STATUS_CODES.includes(statusCode) && Boolean(allowHeader);

  return {
    test: createSecurityTestResult(
      'OPTIONS method handling',
      '200 or 204 + Allow header',
      response.status,
      isValid ? TestStatus.Pass : TestStatus.Fail,
      modifiedRequest,
      response,
    ),
    allowHeader,
  };
}

async function testUnsupportedMethod(options: TestOptions): Promise<TestResult> {
  const request = createTestHttpRequest({ ...options, method: 'FOOBAR' });
  const response = await window.electronAPI.sendHttp(request);
  const statusCode = extractStatusCode(response);

  return createSecurityTestResult(
    'Unsupported method handling',
    '405 Method Not Allowed (or 501)',
    response.status,
    statusCode === EXPECTED_METHOD_NOT_ALLOWED_STATUS || statusCode === EXPECTED_NOT_IMPLEMENTED_STATUS
      ? TestStatus.Pass
      : TestStatus.Fail,
    request,
    response,
  );
}

async function testLargePayload(options: TestOptions): Promise<TestResult> {
  const request = createTestHttpRequest({ ...options, method: 'POST' });
  const modifiedRequest: HttpRequest = {
    ...request,
    headers: { ...request.headers, 'Content-Type': 'application/json' },
    body: 'A'.repeat(LARGE_PAYLOAD_SIZE_BYTES),
  };
  const response = await window.electronAPI.sendHttp(modifiedRequest);
  const statusCode = extractStatusCode(response);

  return createSecurityTestResult(
    `Request size limit (${LARGE_PAYLOAD_SIZE_MB} MB)`,
    '413 Payload Too Large',
    response.status,
    statusCode === EXPECTED_PAYLOAD_TOO_LARGE_STATUS ? TestStatus.Pass : TestStatus.Fail,
    {
      ...modifiedRequest,
      body: `[${LARGE_PAYLOAD_SIZE_MB} MB string]`,
    },
    response,
  );
}

async function testMissingAuthorization(options: TestOptions): Promise<TestResult> {
  const request = createTestHttpRequest(options);
  const minimalHeaders: Record<string, string> = {};

  for (const [key, value] of Object.entries(request.headers))
    if (key.toLowerCase() === 'accept' || key.toLowerCase() === 'content-type') minimalHeaders[key] = value;

  const modifiedRequest: HttpRequest = { ...request, headers: minimalHeaders };

  try {
    const response = await window.electronAPI.sendHttp(modifiedRequest);
    const statusCode = extractStatusCode(response);

    return createSecurityTestResult(
      AUTHORIZATION_TEST_NAME,
      AUTHORIZATION_TEST_EXPECTED,
      response.status,
      statusCode === EXPECTED_UNAUTHORIZED_STATUS ? TestStatus.Pass : TestStatus.Fail,
      modifiedRequest,
      response,
    );
  } catch (error) {
    return createSecurityTestResult(
      AUTHORIZATION_TEST_NAME,
      AUTHORIZATION_TEST_EXPECTED,
      `Unexpected error: ${String(error)}`,
      TestStatus.Bug,
      modifiedRequest,
      null,
    );
  }
}

async function testCors(options: TestOptions): Promise<TestResult> {
  const request = createTestHttpRequest(options);
  const modifiedRequest: HttpRequest = {
    ...request,
    headers: { ...request.headers, Origin: 'https://www.qaontime.com/' },
  };

  try {
    const response = await window.electronAPI.sendHttp(modifiedRequest);
    const acaoHeader = getHeaderValue(response.headers, 'access-control-allow-origin');

    if (!acaoHeader)
      return createSecurityTestResult(
        CORS_TEST_NAME,
        CORS_TEST_EXPECTED,
        'CORS error → API is private (restricted by origin)',
        TestStatus.Info,
        modifiedRequest,
        null,
      );

    return createSecurityTestResult(
      CORS_TEST_NAME,
      CORS_TEST_EXPECTED,
      'No CORS error → API is public (accessible from any domain)',
      TestStatus.Info,
      modifiedRequest,
      response,
    );
  } catch (error) {
    return createSecurityTestResult(
      CORS_TEST_NAME,
      CORS_TEST_EXPECTED,
      `Unexpected error: ${String(error)}`,
      TestStatus.Bug,
      modifiedRequest,
    );
  }
}

async function testNotFound(options: TestOptions): Promise<TestResult> {
  const request = createTestHttpRequest(options);
  const modifiedRequest: HttpRequest = { ...request, url: createNotFoundUrl(request.url) };

  try {
    const response = await window.electronAPI.sendHttp(modifiedRequest);
    const statusCode = extractStatusCode(response);

    return createSecurityTestResult(
      NOT_FOUND_TEST_NAME,
      NOT_FOUND_TEST_EXPECTED,
      response.status,
      statusCode === 404 ? TestStatus.Pass : statusCode === 0 ? TestStatus.FailNoResponse : TestStatus.Fail,
      modifiedRequest,
      response,
    );
  } catch (error) {
    return createSecurityTestResult(
      NOT_FOUND_TEST_NAME,
      NOT_FOUND_TEST_EXPECTED,
      `Unexpected error: ${String(error)}`,
      TestStatus.Bug,
      modifiedRequest,
    );
  }

  function createNotFoundUrl(url: string): string {
    try {
      const parsedUrl = new URL(url);
      parsedUrl.pathname = parsedUrl.pathname.endsWith('/')
        ? `${parsedUrl.pathname}NOT_FOUND`
        : `${parsedUrl.pathname}/NOT_FOUND`;
      return parsedUrl.toString();
    } catch {
      return url.endsWith('/') ? `${url}NOT_FOUND` : `${url}/NOT_FOUND`;
    }
  }
}

function createSecurityTestResult(
  name: string,
  expected: string,
  actual: string,
  status: TestStatus,
  request: HttpRequest | null = null,
  response: any = null,
): TestResult {
  return { name, expected, actual, status, request, response };
}

function validateClickjackingProtection(
  xFrameOptions: string | undefined,
  contentSecurityPolicy: string | undefined,
): { actual: string; status: TestStatus } {
  if (xFrameOptions) {
    const headerValue = xFrameOptions.toUpperCase();

    return {
      actual: `X-Frame-Options: ${headerValue}`,
      status: headerValue === 'DENY' || headerValue === 'SAMEORIGIN' ? TestStatus.Pass : TestStatus.Warning,
    };
  }

  if (contentSecurityPolicy?.includes('frame-ancestors'))
    return {
      actual: `CSP: ${contentSecurityPolicy}`,
      status: /frame-ancestors\s+('none'|'self')/i.test(contentSecurityPolicy) ? TestStatus.Pass : TestStatus.Warning,
    };

  return { status: TestStatus.Warning, actual: 'Missing' };
}

function validateMimeSniffing(xContentTypeOptions: string | undefined): { actual: string; status: TestStatus } {
  if (!xContentTypeOptions) return { status: TestStatus.Fail, actual: 'Missing' };

  const isValid = xContentTypeOptions.toLowerCase() === 'nosniff';
  return {
    actual: isValid ? `X-Content-Type-Options: ${xContentTypeOptions}` : `Unexpected: ${xContentTypeOptions}`,
    status: isValid ? TestStatus.Pass : TestStatus.Fail,
  };
}

function validateCacheControl(
  cacheControl: string | undefined,
  method: Method | string,
): { actual: string; status: TestStatus } {
  if (!cacheControl)
    return {
      actual: 'Missing',
      status: ['GET', 'HEAD'].includes(method.toUpperCase()) ? TestStatus.Fail : TestStatus.Warning,
    };

  return {
    actual: cacheControl,
    status: cacheControl.includes('no-store') || cacheControl.includes('private') ? TestStatus.Pass : TestStatus.Fail,
  };
}

function getCrudTestResults(
  allowHeader: string,
  headers: Record<string, string>,
  url: string,
  response: any,
): TestResult[] {
  try {
    const allowedMethods = String(allowHeader || '')
      .split(',')
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean);
    const body = extractBodyFromResponse(response);
    const methodDescriptions: Record<string, string> = {
      GET: 'Fetch data',
      POST: 'Create resource',
      PUT: 'Update resource',
      PATCH: 'Update resource fields',
      DELETE: 'Remove resource',
      HEAD: 'Headers only',
      OPTIONS: 'Discovery',
    };

    return allowedMethods.map(
      (method: string) =>
        ({
          actual: NOT_AVAILABLE_TEST,
          expected: methodDescriptions[method] || 'Custom method',
          method,
          request: createHttpRequest(body, headers, method, url),
          response: null,
          status: TestStatus.Manual,
        }) as TestResult,
    );
  } catch {
    return [createSecurityTestResult(CRUD_TEST_NAME, CRUD_TEST_EXPECTED, NOT_AVAILABLE_TEST, TestStatus.Manual)];
  }
}

function getManualTests(): TestResult[] {
  return [
    createSecurityTestResult(
      'Invalid authorization cookie/token',
      AUTHORIZATION_TEST_EXPECTED,
      NOT_AVAILABLE_TEST,
      TestStatus.Manual,
    ),
    createSecurityTestResult(
      "Access other user's data",
      'Should return 404 or 403',
      NOT_AVAILABLE_TEST,
      TestStatus.Manual,
    ),
    createSecurityTestResult('Role-based access control', 'Restricted per role', NOT_AVAILABLE_TEST, TestStatus.Manual),
  ];
}
