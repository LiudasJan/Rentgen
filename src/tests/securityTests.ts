import { Method } from 'axios';
import { runCorsTest, runNotFoundTest } from '.';
import { Test, TestStatus } from '../types';

const LARGE_PAYLOAD_SIZE_MB = 10;
const LARGE_PAYLOAD_SIZE_BYTES = LARGE_PAYLOAD_SIZE_MB * 1024 * 1024;
const EXPECTED_PAYLOAD_TOO_LARGE_STATUS = '413';
const EXPECTED_UNAUTHORIZED_STATUS = '401';
const EXPECTED_METHOD_NOT_ALLOWED_STATUS = '405';
const EXPECTED_NOT_IMPLEMENTED_STATUS = '501';
const ACCEPTABLE_OPTIONS_STATUS_CODES = ['200', '204'];

export async function runSecurityTests(
  method: Method,
  url: string,
  headers: Record<string, string>,
  body: string,
): Promise<{ securityTestResults: Test[]; crudTestResults: Test[] }> {
  const securityTestResults: Test[] = [];
  const crudTestResults: Test[] = [];

  try {
    const response = await window.electronAPI.sendHttp({
      url,
      method,
      headers,
      body,
    });

    // 1. Check Server header for version information exposure
    const serverHeader = response.headers?.['server'] || response.headers?.['Server'] || '';
    securityTestResults.push({
      actual: serverHeader || 'No Server header',
      expected: 'Server header should not expose version',
      name: 'No sensitive server headers',
      request: { url, method: 'GET', headers },
      response: response,
      status: /\d/.test(serverHeader) ? TestStatus.Fail : TestStatus.Pass,
    });

    // 2. Check Clickjacking protection
    const xFrameOptions = response.headers?.['x-frame-options'] || response.headers?.['X-Frame-Options'];
    const contentSecurityPolicy =
      response.headers?.['content-security-policy'] || response.headers?.['Content-Security-Policy'];

    let clickjackingStatus = TestStatus.Warning;
    let actualClickjacking = 'Missing';

    if (xFrameOptions) {
      const headerValue = xFrameOptions.toUpperCase();
      if (headerValue === 'DENY' || headerValue === 'SAMEORIGIN') clickjackingStatus = TestStatus.Pass;

      actualClickjacking = `X-Frame-Options: ${headerValue}`;
    } else if (contentSecurityPolicy && contentSecurityPolicy.includes('frame-ancestors')) {
      if (/frame-ancestors\s+('none'|'self')/i.test(contentSecurityPolicy)) clickjackingStatus = TestStatus.Pass;

      actualClickjacking = `CSP: ${contentSecurityPolicy}`;
    }

    securityTestResults.push({
      actual: actualClickjacking,
      expected: 'X-Frame-Options DENY/SAMEORIGIN or CSP frame-ancestors',
      name: 'Clickjacking protection',
      request: { url, method, headers, body },
      response,
      status: clickjackingStatus,
    });

    // 3. Check HSTS (HTTP Strict Transport Security)
    const hstsHeader =
      response.headers?.['strict-transport-security'] || response.headers?.['Strict-Transport-Security'];
    securityTestResults.push({
      actual: hstsHeader ? hstsHeader : 'Missing',
      expected: 'Header should be present on HTTPS endpoints',
      name: 'HSTS (Strict-Transport-Security)',
      request: { url, method, headers, body },
      response,
      status: hstsHeader ? TestStatus.Pass : TestStatus.Warning,
    });

    // 4. Check MIME sniffing protection
    const xContentTypeOptions =
      response.headers?.['x-content-type-options'] || response.headers?.['X-Content-Type-Options'];

    let mimeSniffingStatus = TestStatus.Fail;
    let actualMimeSniffing = 'Missing';

    if (xContentTypeOptions) {
      if (xContentTypeOptions.toLowerCase() === 'nosniff') {
        mimeSniffingStatus = TestStatus.Pass;
        actualMimeSniffing = `X-Content-Type-Options: ${xContentTypeOptions}`;
      } else {
        mimeSniffingStatus = TestStatus.Fail;
        actualMimeSniffing = `Unexpected: ${xContentTypeOptions}`;
      }
    }

    securityTestResults.push({
      actual: actualMimeSniffing,
      expected: 'X-Content-Type-Options: nosniff',
      name: 'MIME sniffing protection',
      request: { url, method, headers, body },
      response,
      status: mimeSniffingStatus,
    });

    // 5. Check Cache-Control settings for API security
    const cacheControlHeader = response.headers?.['cache-control'] || response.headers?.['Cache-Control'];

    let cacheControlStatus = TestStatus.Warning;
    let actualCacheControl = 'Missing';

    if (cacheControlHeader) {
      if (cacheControlHeader.includes('no-store') || cacheControlHeader.includes('private'))
        cacheControlStatus = TestStatus.Pass;
      else cacheControlStatus = TestStatus.Fail;

      actualCacheControl = cacheControlHeader;
    } else {
      const httpMethod = method.toUpperCase();
      if (httpMethod === 'GET' || httpMethod === 'HEAD')
        cacheControlStatus = TestStatus.Fail; // Dangerous for GET/HEAD methods
      else cacheControlStatus = TestStatus.Warning; // Safe by default, but better to specify
    }

    securityTestResults.push({
      actual: actualCacheControl,
      expected: 'Cache-Control: no-store/private',
      name: 'Cache-Control for private API',
      request: { url, method, headers },
      response,
      status: cacheControlStatus,
    });

    // 6. OPTIONS method
    const options = await window.electronAPI.sendHttp({
      url,
      method: 'OPTIONS',
      headers,
      body: null,
    });

    // Accept both 200 and 204 status codes, but require Allow header
    const optionsStatusCode = options.status.split(' ')[0];
    const allowHeader =
      options.headers?.['allow'] ||
      options.headers?.['Allow'] ||
      options.headers?.['access-control-allow-methods'] ||
      options.headers?.['Access-Control-Allow-Methods'];

    const hasAllowHeader = Boolean(allowHeader);
    const isOptionsValid = ACCEPTABLE_OPTIONS_STATUS_CODES.includes(optionsStatusCode) && hasAllowHeader;

    securityTestResults.push({
      actual: options.status,
      expected: '200 or 204 + Allow header',
      name: 'OPTIONS method handling',
      request: { url, method: 'OPTIONS', headers },
      response: options,
      status: isOptionsValid ? TestStatus.Pass : TestStatus.Fail,
    });

    if (isOptionsValid) crudTestResults.push(...getCrudTestResults(allowHeader, url, headers, response));
    else
      crudTestResults.push({
        actual: 'CRUD not available — OPTIONS test failed',
        expected: 'Discover via OPTIONS',
        method: 'CRUD',
        request: null,
        response: null,
        status: TestStatus.Fail,
      });

    // 7. Unsupported method
    const invalidMethodResponse = await window.electronAPI.sendHttp({
      url,
      method: 'FOOBAR',
      headers, // Use original headers
      body, // Use original body
    });
    const invalidMethodStatusCode = invalidMethodResponse.status.split(' ')[0];
    const isValidResponse =
      invalidMethodStatusCode === EXPECTED_METHOD_NOT_ALLOWED_STATUS ||
      invalidMethodStatusCode === EXPECTED_NOT_IMPLEMENTED_STATUS;

    securityTestResults.push({
      actual: invalidMethodResponse.status,
      expected: '405 Method Not Allowed (or 501)',
      name: 'Unsupported method handling',
      request: { url, method: 'FOOBAR', headers, body },
      response: invalidMethodResponse,
      status: isValidResponse ? TestStatus.Pass : TestStatus.Fail,
    });
  } catch (error) {
    securityTestResults.push({
      actual: String(error),
      expected: 'Should respond',
      name: 'Security test error',
      request: { url, headers, body },
      response: null,
      status: TestStatus.Fail,
    });

    const corsResult = await runCorsTest(method, url, headers, body);
    securityTestResults.push(corsResult);
  }

  // 8. Test request size limit with large payload
  const largePayload = 'A'.repeat(LARGE_PAYLOAD_SIZE_BYTES);
  const largePayloadResponse = await window.electronAPI.sendHttp({
    url,
    method: 'POST', // POST method is most commonly used with body
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: largePayload,
  });

  const largePayloadStatusCode = largePayloadResponse.status.split(' ')[0];
  const isPayloadTooLarge = largePayloadStatusCode === EXPECTED_PAYLOAD_TOO_LARGE_STATUS;

  securityTestResults.push({
    actual: largePayloadResponse.status,
    expected: '413 Payload Too Large',
    name: `Request size limit (${LARGE_PAYLOAD_SIZE_MB} MB)`,
    request: { url, method: 'POST', headers, body: `[${LARGE_PAYLOAD_SIZE_MB}MB string]` },
    response: largePayloadResponse,
    status: isPayloadTooLarge ? TestStatus.Pass : TestStatus.Fail,
  });

  // 9. Test missing authorization cookie/token
  try {
    const minimalHeaders: Record<string, string> = {};
    for (const [key, value] of Object.entries(headers))
      if (key.toLowerCase() === 'accept' || key.toLowerCase() === 'content-type') minimalHeaders[key] = value;

    const unauthorizedResponse = await window.electronAPI.sendHttp({
      url,
      method,
      headers: minimalHeaders,
      body,
    });

    const unauthorizedStatusCode = unauthorizedResponse.status.split(' ')[0];
    const isUnauthorized = unauthorizedStatusCode === EXPECTED_UNAUTHORIZED_STATUS;

    securityTestResults.push({
      actual: unauthorizedResponse.status,
      expected: 'Should return 401 Unauthorized',
      name: 'Missing authorization cookie/token',
      request: { url, method, headers: minimalHeaders, body },
      response: unauthorizedResponse,
      status: isUnauthorized ? TestStatus.Pass : TestStatus.Fail,
    });
  } catch (error) {
    securityTestResults.push({
      actual: String(error),
      expected: 'Should return 401 Unauthorized',
      name: 'Missing authorization cookie/token',
      request: { url, method, headers: {}, body },
      response: null,
      status: TestStatus.Bug,
    });
  }

  // 10. Run CORS validation test
  const corsResult = await runCorsTest(method, url, headers, body);
  securityTestResults.push(corsResult);

  // 11. Run 404 Not Found test
  const notFoundTest = await runNotFoundTest(method, url, headers, body);
  securityTestResults.push(notFoundTest);

  // --- Manual tests (requires human verification) ---
  securityTestResults.push(
    {
      name: 'Invalid authorization cookie/token',
      expected: 'Should return 401 Unauthorized',
      actual: 'Not available yet',
      status: TestStatus.Manual,
      request: null,
      response: null,
    },
    {
      name: 'Access other user’s data',
      expected: 'Should return 404 or 403',
      actual: 'Not available yet',
      status: TestStatus.Manual,
      request: null,
      response: null,
    },
    {
      name: 'Role-based access control',
      expected: 'Restricted per role',
      actual: 'Not available yet',
      status: TestStatus.Manual,
      request: null,
      response: null,
    },
  );

  return { securityTestResults, crudTestResults };
}

function getCrudTestResults(
  allowHeader: string,
  url: string,
  headers: Record<string, string>,
  baseResponse: any,
): Test[] {
  try {
    const allowedMethods = String(allowHeader || '')
      .split(',')
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean);

    // Try to extract sample body from original response
    let body = {};
    try {
      if (typeof baseResponse?.body === 'string') body = JSON.parse(baseResponse.body);
      else if (baseResponse?.body && typeof baseResponse.body === 'object') body = baseResponse.body;
      else body = {};
    } catch {
      body = {};
    }

    // Method descriptions for CRUD operations
    const methodDescriptions: Record<string, string> = {
      GET: 'Fetch data',
      POST: 'Create resource',
      PUT: 'Update resource',
      PATCH: 'Update resource fields',
      DELETE: 'Remove resource',
      HEAD: 'Headers only',
      OPTIONS: 'Discovery',
    };

    // Build CRUD test rows from allowed methods
    const rows: Test[] = allowedMethods.map((method: string) => {
      const request: any = { url, method, headers };

      if (!['GET', 'HEAD'].includes(method)) request.body = body && Object.keys(body).length ? body : {};

      return {
        actual: 'Not available yet',
        expected: methodDescriptions[method] || 'Custom method',
        method,
        request,
        response: null,
        status: TestStatus.Manual,
      } as Test;
    });

    return rows;
  } catch {
    // Fallback
    return [
      {
        method: 'CRUD',
        expected: 'Discover via OPTIONS',
        actual: 'Not available',
        status: TestStatus.Manual,
        request: null,
        response: null,
      },
    ];
  }
}
