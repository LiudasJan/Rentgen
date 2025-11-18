import { Method } from 'axios';
import { BaseTests, NOT_AVAILABLE_TEST } from '.';
import { RESPONSE_STATUS } from '../constants/responseStatus';
import { Test } from '../decorators';
import { HttpRequest, HttpResponse, TestResult, TestStatus } from '../types';
import {
  createHttpRequest,
  createTestHttpRequest,
  determineTestStatus,
  extractBodyFromResponse,
  getHeaderValue,
} from '../utils';

const LARGE_PAYLOAD_SIZE_MB = 10;
const LARGE_PAYLOAD_SIZE_BYTES = LARGE_PAYLOAD_SIZE_MB * 1024 * 1024;

const AUTHORIZATION_TEST_NAME = 'Missing authorization cookie/token';
const AUTHORIZATION_TEST_EXPECTED = 'Should return 401 Unauthorized';
const CORS_TEST_NAME = 'CORS policy check';
const CORS_TEST_EXPECTED = 'Detect if API is public or private';
const CRUD_TEST_NAME = 'CRUD';
const CRUD_TEST_EXPECTED = 'Discover via OPTIONS';
const LARGE_PAYLOAD_NAME = `Request size limit (${LARGE_PAYLOAD_SIZE_MB} MB)`;
const LARGE_PAYLOAD_EXPECTED = '413 Payload Too Large';
const MISSING_ACTUAL = 'Missing';
const NOT_FOUND_TEST_NAME = '404 Not Found';
const NOT_FOUND_TEST_EXPECTED = '404 Not Found';
const REFLECTED_PAYLOAD_SAFETY_TEST_NAME = 'Reflected Payload Safety';
const REFLECTED_PAYLOAD_SAFETY_TEST_EXPECTED = `Reject with ${RESPONSE_STATUS.CLIENT_ERROR} or ${RESPONSE_STATUS.UNPROCESSABLE_ENTITY} without mirrored content`;
const UNSUPPORTED_METHOD_TEST_NAME = 'Unsupported HTTP Method Handling';
const UNSUPPORTED_METHOD_TEST_EXPECTED = '405 Method Not Allowed or 501 Not Implemented';

export class SecurityTests extends BaseTests {
  public async run(): Promise<{
    securityTestResults: TestResult[];
    crudTestResults: TestResult[];
  }> {
    const securityTestResults: TestResult[] = [];
    const crudTestResults: TestResult[] = [];
    const request = createTestHttpRequest(this.options);
    const { headers, url } = request;

    try {
      const response = await window.electronAPI.sendHttp(request);

      // Run all header-based security tests
      securityTestResults.push(
        this.testServerHeaderSecurity(request, response),
        this.testClickjackingProtection(request, response),
        this.testHSTS(request, response),
        this.testMimeSniffing(request, response),
        this.testCacheControl(request, response),
      );

      // Test OPTIONS method and get CRUD results
      const { testResult, allowHeader } = await this.testOptionsMethod();
      securityTestResults.push(testResult);

      if (testResult.status === TestStatus.Pass)
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
      await this.testUnsupportedMethod(),
      await this.testLargePayload(),
      await this.testMissingAuthorization(),
      await this.testCors(),
      await this.testNotFound(),
      await this.testReflectedPayloadSafety(),
      ...getManualTests(),
    );

    return { securityTestResults, crudTestResults };
  }

  @Test('Validates that server header does not expose sensitive version information')
  private testServerHeaderSecurity(request: HttpRequest, response: HttpResponse): TestResult {
    this.onTestStart?.();

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

  @Test('Checks for clickjacking protection via X-Frame-Options or CSP frame-ancestors')
  private testClickjackingProtection(request: HttpRequest, response: HttpResponse): TestResult {
    this.onTestStart?.();

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

  @Test('Verifies Strict-Transport-Security header is present on HTTPS endpoints')
  private testHSTS(request: HttpRequest, response: HttpResponse): TestResult {
    this.onTestStart?.();

    const hsts = getHeaderValue(response.headers, 'strict-transport-security');

    return createSecurityTestResult(
      'HSTS (Strict-Transport-Security)',
      'Header should be present on HTTPS endpoints',
      hsts || MISSING_ACTUAL,
      hsts ? TestStatus.Pass : TestStatus.Warning,
      request,
      response,
    );
  }

  @Test('Checks for X-Content-Type-Options: nosniff to prevent MIME sniffing')
  private testMimeSniffing(request: HttpRequest, response: HttpResponse): TestResult {
    this.onTestStart?.();

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

  @Test('Validates Cache-Control header for private API endpoints')
  private testCacheControl(request: HttpRequest, response: HttpResponse): TestResult {
    this.onTestStart?.();

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

  @Test('Tests OPTIONS method handling and retrieves allowed HTTP methods')
  private async testOptionsMethod(): Promise<{ testResult: TestResult; allowHeader: string }> {
    this.onTestStart?.();

    const request = createTestHttpRequest(this.options);
    const modifiedRequest: HttpRequest = { url: request.url, method: 'OPTIONS', headers: request.headers };
    const response = await window.electronAPI.sendHttp(modifiedRequest);
    const allowHeader =
      getHeaderValue(response.headers, 'allow') || getHeaderValue(response.headers, 'access-control-allow-methods');
    const { actual, status } = determineTestStatus(response, (response, statusCode) => {
      const testStatus = { actual: response.status, status: TestStatus.Fail };
      if ((statusCode === RESPONSE_STATUS.OK || statusCode === RESPONSE_STATUS.NO_CONTENT) && Boolean(allowHeader))
        testStatus.status = TestStatus.Pass;

      return testStatus;
    });

    return {
      testResult: createSecurityTestResult(
        'OPTIONS method handling',
        '200 or 204 + Allow header',
        actual,
        status,
        modifiedRequest,
        response,
      ),
      allowHeader,
    };
  }

  @Test('Verifies server properly rejects unsupported HTTP methods with 405 or 501')
  private async testUnsupportedMethod(): Promise<TestResult> {
    this.onTestStart?.();

    const request = createTestHttpRequest({ ...this.options, method: 'FOOBAR' });

    try {
      const response = await window.electronAPI.sendHttp(request);
      const { actual, status } = determineTestStatus(response, (response, statusCode) => {
        const testStatus = { actual: response.status, status: TestStatus.Fail };
        if (statusCode === RESPONSE_STATUS.METHOD_NOT_ALLOWED || statusCode === RESPONSE_STATUS.NOT_IMPLEMENTED)
          testStatus.status = TestStatus.Pass;

        return testStatus;
      });

      return createSecurityTestResult(
        UNSUPPORTED_METHOD_TEST_NAME,
        UNSUPPORTED_METHOD_TEST_EXPECTED,
        actual,
        status,
        request,
        response,
      );
    } catch (error) {
      return createSecurityTestResult(
        UNSUPPORTED_METHOD_TEST_NAME,
        UNSUPPORTED_METHOD_TEST_EXPECTED,
        `Unexpected error: ${String(error)}`,
        TestStatus.Bug,
        request,
      );
    }
  }

  @Test('Tests request size limit by sending a large payload')
  private async testLargePayload(): Promise<TestResult> {
    this.onTestStart?.();

    const request = createTestHttpRequest({ ...this.options, method: 'POST' });
    const modifiedRequest: HttpRequest = {
      ...request,
      headers: { ...request.headers, 'Content-Type': 'application/json' },
      body: 'A'.repeat(LARGE_PAYLOAD_SIZE_BYTES),
    };

    try {
      const response = await window.electronAPI.sendHttp(modifiedRequest);
      const { actual, status } = determineTestStatus(response, (response, statusCode) => {
        const testStatus = { actual: response.status, status: TestStatus.Fail };
        if (statusCode === RESPONSE_STATUS.PAYLOAD_TOO_LARGE) testStatus.status = TestStatus.Pass;

        return testStatus;
      });

      return createSecurityTestResult(
        LARGE_PAYLOAD_NAME,
        LARGE_PAYLOAD_EXPECTED,
        actual,
        status,
        {
          ...modifiedRequest,
          body: `[${LARGE_PAYLOAD_SIZE_MB} MB string]`,
        },
        response,
      );
    } catch (error) {
      return createSecurityTestResult(
        LARGE_PAYLOAD_NAME,
        LARGE_PAYLOAD_EXPECTED,
        `Unexpected error: ${String(error)}`,
        TestStatus.Bug,
        modifiedRequest,
      );
    }
  }

  @Test('Checks if API requires authorization by removing auth headers')
  private async testMissingAuthorization(): Promise<TestResult> {
    this.onTestStart?.();

    const request = createTestHttpRequest(this.options);
    const minimalHeaders: Record<string, string> = {};

    for (const [key, value] of Object.entries(request.headers))
      if (key.toLowerCase() === 'accept' || key.toLowerCase() === 'content-type') minimalHeaders[key] = value;

    const modifiedRequest: HttpRequest = { ...request, headers: minimalHeaders };

    try {
      const response = await window.electronAPI.sendHttp(modifiedRequest);
      const { actual, status } = determineTestStatus(response, (response, statusCode) => {
        const testStatus = { actual: response.status, status: TestStatus.Fail };
        if (statusCode === RESPONSE_STATUS.UNAUTHORIZED) testStatus.status = TestStatus.Pass;

        return testStatus;
      });

      return createSecurityTestResult(
        AUTHORIZATION_TEST_NAME,
        AUTHORIZATION_TEST_EXPECTED,
        actual,
        status,
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
      );
    }
  }

  @Test('Determines if API is public or private by testing CORS policy')
  private async testCors(): Promise<TestResult> {
    this.onTestStart?.();

    const request = createTestHttpRequest(this.options);
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

  @Test('Validates proper 404 Not Found response for non-existent endpoints')
  private async testNotFound(): Promise<TestResult> {
    this.onTestStart?.();

    const request = createTestHttpRequest(this.options);
    const modifiedRequest: HttpRequest = { ...request, url: createNotFoundUrl(request.url) };

    try {
      const response = await window.electronAPI.sendHttp(modifiedRequest);
      const { actual, status } = determineTestStatus(response, (response, statusCode) => {
        const testStatus = { actual: response.status, status: TestStatus.Fail };
        if (statusCode === RESPONSE_STATUS.NOT_FOUND) testStatus.status = TestStatus.Pass;
        else if (statusCode === RESPONSE_STATUS.NETWORK_ERROR) testStatus.status = TestStatus.FailNoResponse;

        return testStatus;
      });

      return createSecurityTestResult(
        NOT_FOUND_TEST_NAME,
        NOT_FOUND_TEST_EXPECTED,
        actual,
        status,
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
  }

  @Test('Tests reflected payload safety by sending a payload that should be rejected if reflected')
  private async testReflectedPayloadSafety(): Promise<TestResult> {
    this.onTestStart?.();

    const { method } = this.options;

    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase()))
      return createSecurityTestResult(
        REFLECTED_PAYLOAD_SAFETY_TEST_NAME,
        REFLECTED_PAYLOAD_SAFETY_TEST_EXPECTED,
        NOT_AVAILABLE_TEST,
        TestStatus.Manual,
      );

    const request = createTestHttpRequest(this.options);
    const testValue = 'No XSS echo';
    const modifiedRequest: HttpRequest = {
      ...request,
      body: `<script>alert("${testValue}")</script>`,
    };

    try {
      const response = await window.electronAPI.sendHttp(modifiedRequest);
      const { actual, status } = determineTestStatus(response, (response, statusCode) => {
        const responseBody = typeof response.body === 'string' ? response.body : JSON.stringify(response.body);
        if (
          (!responseBody || !responseBody.includes(testValue)) &&
          (statusCode === RESPONSE_STATUS.CLIENT_ERROR || statusCode === RESPONSE_STATUS.UNPROCESSABLE_ENTITY)
        )
          return { actual: `${response.status} → without mirrored content`, status: TestStatus.Pass };

        return { actual: response.status, status: TestStatus.Fail };
      });

      return createSecurityTestResult(
        REFLECTED_PAYLOAD_SAFETY_TEST_NAME,
        REFLECTED_PAYLOAD_SAFETY_TEST_EXPECTED,
        actual,
        status,
        modifiedRequest,
        response,
      );
    } catch (error) {
      return createSecurityTestResult(
        REFLECTED_PAYLOAD_SAFETY_TEST_NAME,
        REFLECTED_PAYLOAD_SAFETY_TEST_EXPECTED,
        `Unexpected error: ${String(error)}`,
        TestStatus.Bug,
        modifiedRequest,
      );
    }
  }
}

function createSecurityTestResult(
  name: string,
  expected: string,
  actual: string,
  status: TestStatus,
  request: HttpRequest | null = null,
  response: HttpResponse | null = null,
): TestResult {
  return { name, expected, actual, status, request, response };
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

  return { status: TestStatus.Warning, actual: MISSING_ACTUAL };
}

function validateMimeSniffing(xContentTypeOptions: string | undefined): { actual: string; status: TestStatus } {
  if (!xContentTypeOptions) return { status: TestStatus.Fail, actual: MISSING_ACTUAL };

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
      actual: MISSING_ACTUAL,
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
  response: HttpResponse,
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
          name: method,
          actual: NOT_AVAILABLE_TEST,
          expected: methodDescriptions[method] || 'Custom method',
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
