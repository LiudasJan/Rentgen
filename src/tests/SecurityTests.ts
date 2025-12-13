import { Method } from 'axios';
import { getResponseStatusTitle, RESPONSE_STATUS } from '../constants/responseStatus';
import { Test } from '../decorators';
import { HttpRequest, HttpResponse, TestOptions, TestResult, TestStatus } from '../types';
import {
  createHttpRequest,
  createTestHttpRequest,
  extractBodyFromResponse,
  getHeaderValue,
  uppercaseDomain,
  uppercasePath,
} from '../utils';
import {
  BaseTests,
  createErrorTestResult,
  createTestResult,
  determineTestStatus,
  NOT_AVAILABLE_TEST,
  SUCCESS_RESPONSE_EXPECTED,
} from './BaseTests';

export const AUTHORIZATION_TEST_NAME = 'Missing Authorization Cookie/Token';
export const LARGE_PAYLOAD_TEST_NAME = 'Large Payload Test';
export const CACHE_CONTROL_PRIVATE_API_TEST_NAME = 'Cache-Control for Private API';
export const CLICKJACKING_PROTECTION_TEST_NAME = 'Clickjacking Protection';
export const CORS_TEST_NAME = 'CORS Policy Check';
export const CRUD_TEST_NAME = 'CRUD';
export const HSTS_STRICT_TRANSPORT_SECURITY_TEST_NAME = 'HSTS (Strict-Transport-Security)';
export const MIME_SNIFFING_PROTECTION_TEST_NAME = 'MIME Sniffing Protection';
export const NO_SENSITIVE_SERVER_HEADERS_TEST_NAME = 'No Sensitive Server Headers';
export const NOT_FOUND_TEST_NAME = `${RESPONSE_STATUS.NOT_FOUND} ${getResponseStatusTitle(RESPONSE_STATUS.NOT_FOUND)}`;
export const OPTIONS_METHOD_HANDLING_TEST_NAME = 'OPTIONS Method Handling';
export const REFLECTED_PAYLOAD_SAFETY_TEST_NAME = 'Reflected Payload Safety';
export const UPPERCASE_DOMAIN_TEST_NAME = 'Uppercase Domain Test';
export const UPPERCASE_PATH_TEST_NAME = 'Uppercase Path Test';
export const UNSUPPORTED_METHOD_TEST_NAME = 'Unsupported HTTP Method Handling';

const AUTHORIZATION_TEST_EXPECTED = `${RESPONSE_STATUS.UNAUTHORIZED} ${getResponseStatusTitle(RESPONSE_STATUS.UNAUTHORIZED)}`;
const CORS_TEST_EXPECTED = 'Public or Private API';
const CRUD_TEST_EXPECTED = 'Discover via OPTIONS';
const LARGE_PAYLOAD_TEST_EXPECTED = `${RESPONSE_STATUS.PAYLOAD_TOO_LARGE} ${getResponseStatusTitle(RESPONSE_STATUS.PAYLOAD_TOO_LARGE)}`;
const MISSING_ACTUAL = '-';
const NOT_FOUND_TEST_EXPECTED = `${RESPONSE_STATUS.NOT_FOUND} ${getResponseStatusTitle(RESPONSE_STATUS.NOT_FOUND)}`;
const OPTIONS_METHOD_HANDLING_TEST_EXPECTED = `${RESPONSE_STATUS.OK} ${getResponseStatusTitle(RESPONSE_STATUS.OK)} or ${RESPONSE_STATUS.NO_CONTENT} ${getResponseStatusTitle(RESPONSE_STATUS.NO_CONTENT)} + Allow Header`;
const REFLECTED_PAYLOAD_SAFETY_TEST_EXPECTED = `${RESPONSE_STATUS.BAD_REQUEST} ${getResponseStatusTitle(RESPONSE_STATUS.BAD_REQUEST)} or ${RESPONSE_STATUS.UNPROCESSABLE_ENTITY} ${getResponseStatusTitle(RESPONSE_STATUS.UNPROCESSABLE_ENTITY)} + No Mirrored Content`;
const UPPERCASE_PATH_TEST_EXPECTED = `${RESPONSE_STATUS.NOT_FOUND} ${getResponseStatusTitle(RESPONSE_STATUS.NOT_FOUND)}`;
const UNSUPPORTED_METHOD_TEST_EXPECTED = `${RESPONSE_STATUS.METHOD_NOT_ALLOWED} ${getResponseStatusTitle(RESPONSE_STATUS.METHOD_NOT_ALLOWED)} or ${RESPONSE_STATUS.NOT_IMPLEMENTED} ${getResponseStatusTitle(RESPONSE_STATUS.NOT_IMPLEMENTED)}`;

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

      this.onTestStart?.();
      if (testResult.status === TestStatus.Pass)
        crudTestResults.push(...this.getCrudTestResults(allowHeader, headers, url, response));
      else
        crudTestResults.push(
          createTestResult(
            CRUD_TEST_NAME,
            CRUD_TEST_EXPECTED,
            'OPTIONS Method Handling Failed → CRUD Not Available',
            TestStatus.Fail,
          ),
        );
    } catch (error) {
      securityTestResults.push(createErrorTestResult('Security Test Error', 'Responds', String(error), request));
    }

    // Run tests that don't depend on initial response
    securityTestResults.push(
      await this.testUnsupportedMethod(),
      await this.testMissingAuthorization(),
      await this.testCors(),
      await this.testNotFound(),
      await this.testReflectedPayloadSafety(),
      await this.testUppercaseDomain(),
      await this.testUppercasePath(),
      ...getManualTests(),
    );

    return { securityTestResults, crudTestResults };
  }

  @Test('Validates that server header does not expose sensitive version information')
  private testServerHeaderSecurity(request: HttpRequest, response: HttpResponse): TestResult {
    this.onTestStart?.();

    const serverHeader = getHeaderValue(response.headers, 'server');

    return createTestResult(
      NO_SENSITIVE_SERVER_HEADERS_TEST_NAME,
      'Server Header Does Not Expose Version',
      serverHeader || 'No Server Header',
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

    return createTestResult(
      CLICKJACKING_PROTECTION_TEST_NAME,
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

    return createTestResult(
      HSTS_STRICT_TRANSPORT_SECURITY_TEST_NAME,
      'Header Present on HTTPS Endpoints',
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

    return createTestResult(
      MIME_SNIFFING_PROTECTION_TEST_NAME,
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

    return createTestResult(
      CACHE_CONTROL_PRIVATE_API_TEST_NAME,
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

    try {
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
        testResult: createTestResult(
          OPTIONS_METHOD_HANDLING_TEST_NAME,
          OPTIONS_METHOD_HANDLING_TEST_EXPECTED,
          actual,
          status,
          modifiedRequest,
          response,
        ),
        allowHeader,
      };
    } catch (error) {
      return {
        testResult: createErrorTestResult(
          OPTIONS_METHOD_HANDLING_TEST_NAME,
          OPTIONS_METHOD_HANDLING_TEST_EXPECTED,
          String(error),
          modifiedRequest,
        ),
        allowHeader: '',
      };
    }
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

      return createTestResult(
        UNSUPPORTED_METHOD_TEST_NAME,
        UNSUPPORTED_METHOD_TEST_EXPECTED,
        actual,
        status,
        request,
        response,
      );
    } catch (error) {
      return createErrorTestResult(
        UNSUPPORTED_METHOD_TEST_NAME,
        UNSUPPORTED_METHOD_TEST_EXPECTED,
        String(error),
        request,
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

      return createTestResult(
        AUTHORIZATION_TEST_NAME,
        AUTHORIZATION_TEST_EXPECTED,
        actual,
        status,
        modifiedRequest,
        response,
      );
    } catch (error) {
      return createErrorTestResult(
        AUTHORIZATION_TEST_NAME,
        AUTHORIZATION_TEST_EXPECTED,
        String(error),
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
      headers: { ...request.headers, Origin: 'https://rentgen.io/' },
    };

    try {
      const response = await window.electronAPI.sendHttp(modifiedRequest);
      const acaoHeader = getHeaderValue(response.headers, 'access-control-allow-origin');

      if (!acaoHeader)
        return createTestResult(
          CORS_TEST_NAME,
          CORS_TEST_EXPECTED,
          'CORS Error → Private API (Restricted By Origin)',
          TestStatus.Info,
          modifiedRequest,
          null,
        );

      return createTestResult(
        CORS_TEST_NAME,
        CORS_TEST_EXPECTED,
        'No CORS Error → Public API (Accessible From Any Domain)',
        TestStatus.Info,
        modifiedRequest,
        response,
      );
    } catch (error) {
      return createErrorTestResult(CORS_TEST_NAME, CORS_TEST_EXPECTED, String(error), modifiedRequest);
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

      return createTestResult(NOT_FOUND_TEST_NAME, NOT_FOUND_TEST_EXPECTED, actual, status, modifiedRequest, response);
    } catch (error) {
      return createErrorTestResult(NOT_FOUND_TEST_NAME, NOT_FOUND_TEST_EXPECTED, String(error), modifiedRequest);
    }
  }

  @Test('Tests reflected payload safety by sending a payload that should be rejected if reflected')
  private async testReflectedPayloadSafety(): Promise<TestResult> {
    this.onTestStart?.();

    const { method } = this.options;

    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase()))
      return createTestResult(
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
          (statusCode === RESPONSE_STATUS.BAD_REQUEST || statusCode === RESPONSE_STATUS.UNPROCESSABLE_ENTITY)
        )
          return { actual: `${response.status} + No Mirrored Content`, status: TestStatus.Pass };

        return { actual: response.status, status: TestStatus.Fail };
      });

      return createTestResult(
        REFLECTED_PAYLOAD_SAFETY_TEST_NAME,
        REFLECTED_PAYLOAD_SAFETY_TEST_EXPECTED,
        actual,
        status,
        modifiedRequest,
        response,
      );
    } catch (error) {
      return createErrorTestResult(
        REFLECTED_PAYLOAD_SAFETY_TEST_NAME,
        REFLECTED_PAYLOAD_SAFETY_TEST_EXPECTED,
        String(error),
        modifiedRequest,
      );
    }
  }

  @Test(
    'Tests if the server behaves according to RFC 3986 — specifically, that the domain part is treated as case-insensitive',
  )
  private async testUppercaseDomain(): Promise<TestResult> {
    this.onTestStart?.();

    const request = createTestHttpRequest(this.options);
    const modifiedRequest: HttpRequest = { ...request, url: uppercaseDomain(request.url) };

    try {
      const response = await window.electronAPI.sendHttp(modifiedRequest);
      const { actual, status } = determineTestStatus(response, (response, statusCode) => {
        const testStatus = { actual: response.status, status: TestStatus.Fail };
        if (statusCode >= RESPONSE_STATUS.OK && statusCode < RESPONSE_STATUS.REDIRECT)
          testStatus.status = TestStatus.Pass;

        return testStatus;
      });

      return createTestResult(
        UPPERCASE_DOMAIN_TEST_NAME,
        SUCCESS_RESPONSE_EXPECTED,
        actual,
        status,
        modifiedRequest,
        response,
      );
    } catch (error) {
      return createErrorTestResult(
        UPPERCASE_DOMAIN_TEST_NAME,
        SUCCESS_RESPONSE_EXPECTED,
        String(error),
        modifiedRequest,
      );
    }
  }

  @Test(
    'Tests if the server behaves according to RFC 3986 — specifically, that the path part is treated as case-sensitive',
  )
  private async testUppercasePath(): Promise<TestResult> {
    this.onTestStart?.();

    const request = createTestHttpRequest(this.options);
    const modifiedRequest: HttpRequest = { ...request, url: uppercasePath(request.url) };

    try {
      const response = await window.electronAPI.sendHttp(modifiedRequest);
      const { actual, status } = determineTestStatus(response, (response, statusCode) => {
        const testStatus = { actual: response.status, status: TestStatus.Fail };
        if (statusCode === RESPONSE_STATUS.NOT_FOUND) testStatus.status = TestStatus.Pass;

        return testStatus;
      });

      return createTestResult(
        UPPERCASE_PATH_TEST_NAME,
        UPPERCASE_PATH_TEST_EXPECTED,
        actual,
        status,
        modifiedRequest,
        response,
      );
    } catch (error) {
      return createErrorTestResult(
        UPPERCASE_PATH_TEST_NAME,
        UPPERCASE_PATH_TEST_EXPECTED,
        String(error),
        modifiedRequest,
      );
    }
  }

  @Test('Generates CRUD test results based on Allow header from OPTIONS response')
  private getCrudTestResults(
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
        GET: 'Fetch Data',
        POST: 'Create Resource',
        PUT: 'Update Resource',
        PATCH: 'Update Resource Fields',
        DELETE: 'Remove Resource',
        HEAD: 'Headers Only',
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
      return [createTestResult(CRUD_TEST_NAME, CRUD_TEST_EXPECTED, NOT_AVAILABLE_TEST, TestStatus.Manual)];
    }
  }
}

export async function runLargePayloadTest(options: TestOptions, size: number): Promise<TestResult> {
  const request = createTestHttpRequest({ ...options, method: 'POST' });
  const modifiedRequest: HttpRequest = {
    ...request,
    headers: { ...request.headers, 'Content-Type': 'application/json' },
    body: 'A'.repeat(size * 1024 * 1024),
  };

  try {
    const response = await window.electronAPI.sendHttp(modifiedRequest);
    const { actual, status } = determineTestStatus(response, (response, statusCode) => {
      const testStatus = { actual: response.status, status: TestStatus.Fail };
      if (statusCode === RESPONSE_STATUS.PAYLOAD_TOO_LARGE) testStatus.status = TestStatus.Pass;

      return testStatus;
    });

    return createTestResult(
      LARGE_PAYLOAD_TEST_NAME,
      LARGE_PAYLOAD_TEST_EXPECTED,
      actual,
      status,
      {
        ...modifiedRequest,
        body: `[${size} MB string]`,
      },
      response,
    );
  } catch (error) {
    return createErrorTestResult(LARGE_PAYLOAD_TEST_NAME, LARGE_PAYLOAD_TEST_EXPECTED, String(error), modifiedRequest);
  }
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

function getManualTests(): TestResult[] {
  return [
    createTestResult(LARGE_PAYLOAD_TEST_NAME, LARGE_PAYLOAD_TEST_EXPECTED, '', TestStatus.Manual),
    createTestResult(
      'Invalid Authorization Cookie/Token',
      AUTHORIZATION_TEST_EXPECTED,
      NOT_AVAILABLE_TEST,
      TestStatus.Manual,
    ),
    createTestResult(
      "Access Other User's Data",
      `${RESPONSE_STATUS.FORBIDDEN} ${getResponseStatusTitle(RESPONSE_STATUS.FORBIDDEN)} or ${RESPONSE_STATUS.NOT_FOUND} ${getResponseStatusTitle(RESPONSE_STATUS.NOT_FOUND)}`,
      NOT_AVAILABLE_TEST,
      TestStatus.Manual,
    ),
    createTestResult('Role-based Access Control', 'Restricted Per Role', NOT_AVAILABLE_TEST, TestStatus.Manual),
  ];
}
