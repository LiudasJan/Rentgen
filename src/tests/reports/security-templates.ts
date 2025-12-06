import {
  AUTHORIZATION_TEST_NAME,
  CACHE_CONTROL_PRIVATE_API_TEST_NAME,
  CLICKJACKING_PROTECTION_TEST_NAME,
  HSTS_STRICT_TRANSPORT_SECURITY_TEST_NAME,
  LARGE_PAYLOAD_TEST_NAME,
  MIME_SNIFFING_PROTECTION_TEST_NAME,
  NO_SENSITIVE_SERVER_HEADERS_TEST_NAME,
  NOT_FOUND_TEST_NAME,
  OPTIONS_METHOD_HANDLING_TEST_NAME,
  REFLECTED_PAYLOAD_SAFETY_TEST_NAME,
  UNSUPPORTED_METHOD_TEST_NAME,
  UPPERCASE_DOMAIN_TEST_NAME,
  UPPERCASE_PATH_TEST_NAME,
} from '../SecurityTests';

export const securityTemplates: Record<string, string> = {
  [NO_SENSITIVE_SERVER_HEADERS_TEST_NAME]: `BUG REPORT – No Sensitive Server Headers

The response exposes the server version in the Server header.
Revealing version numbers increases the attack surface by allowing attackers to match known vulnerabilities.

Why it's a bug:
Only the server type may be exposed. Version numbers must never be returned according to standard API hardening practices.

Request:
{{CURL}}

Headers:
{{RESPONSE_HEADERS_BLOCK}}

Expected:Server header without version number (e.g., "Server: cloudflare")
OR the Server header removed entirely.

Severity:
Low (Security Hardening)

Fix:
Disable server version tokens on the proxy / gateway.
Most servers support configuration to hide version numbers.`,
  [CLICKJACKING_PROTECTION_TEST_NAME]: `BUG REPORT – Clickjacking Protection Missing

The response does not include X-Frame-Options or a CSP with frame-ancestors.
Without these headers, the application can be embedded in an attacker-controlled
iframe, enabling clickjacking attacks.

Why it's a bug:
Modern security guidelines require one of the following:

- X-Frame-Options: DENY
- X-Frame-Options: SAMEORIGIN
OR a Content-Security-Policy containing:
- frame-ancestors 'none' or 'self'

Without these, UI redressing attacks become possible.

Request:
{{CURL}}

Headers:
{{RESPONSE_HEADERS_BLOCK}}

Expected:
At least one protective header present:
- X-Frame-Options: DENY/SAMEORIGIN
OR
- Content-Security-Policy with frame-ancestors directive.

Severity:
Low (Security Hardening)

Fix:
Add clickjacking protection headers at the API gateway or reverse proxy.`,
  [HSTS_STRICT_TRANSPORT_SECURITY_TEST_NAME]: `BUG REPORT – Missing HSTS (Strict-Transport-Security)

The HTTPS response does not include the Strict-Transport-Security header.
Without HSTS, users may be downgraded to HTTP by network attackers, exposing them to man-in-the-middle risk.

Why it's a bug:
HSTS is required to:
- Force the browser to always use HTTPS
- Prevent protocol downgrade attacks
- Block SSL stripping attempts

Even if HTTPS is already in use, HSTS must still be present.

Request:
{{CURL}}

Headers:
{{RESPONSE_HEADERS_BLOCK}}

Expected:
Strict-Transport-Security header, for example:
Strict-Transport-Security: max-age=31536000; includeSubDomains

Severity:
Low (Security Hardening)

Fix:
Add HSTS at the load balancer, reverse proxy, or gateway layer.`,
  [MIME_SNIFFING_PROTECTION_TEST_NAME]: `BUG REPORT – Missing MIME Sniffing Protection

The response does not include X-Content-Type-Options: nosniff.
Without this header, browsers may guess MIME types, enabling content-typeconfusion attacks.

Why it's a bug:
Without nosniff, browsers may:
- Execute unintended scripts
- Serve disguised malicious content
- Bypass security rules tied to Content-Type

nosniff forces browsers to respect the declared MIME type.

Request:
{{CURL}}

Headers:
{{RESPONSE_HEADERS_BLOCK}}

Expected:
X-Content-Type-Options: nosniff

Severity:
Low (Security Hardening)

Fix:
Add X-Content-Type-Options: nosniff on all API and static responses.`,
  [CACHE_CONTROL_PRIVATE_API_TEST_NAME]: `BUG REPORT – Missing Cache-Control Protection for Private API

The response does not include Cache-Control: no-store or private.
Without this, sensitive API responses may be cached by browsers or proxies.

Why it's a bug:
Private endpoints must not be cached because caching can:
- Store sensitive data in browser history/disk
- Leak information on shared devices
- Expose authentication or financial data
- Serve stale responses unexpectedly

no-store prevents any caching.
private restricts caching only to the end user's browser.

Request:
{{CURL}}

Headers:
{{RESPONSE_HEADERS_BLOCK}}

Expected:
Cache-Control: no-store
OR
Cache-Control: private

Severity:
Low (Security Hardening)

Fix:
Add cache protection headers on the proxy or API gateway.`,
  [OPTIONS_METHOD_HANDLING_TEST_NAME]: `BUG REPORT – Incorrect OPTIONS Method Handling

The API does not correctly respond to OPTIONS preflight requests.
The response is missing an Allow header or returns an unexpected status.

Why it's a bug:
Correct OPTIONS behavior requires:
- Status 200 OK or 204 No Content
- Allow header listing supported methods

Without this:
- CORS behavior becomes unpredictable
- Clients cannot discover allowed methods
- Tooling and SDKs may malfunction

Request:
{{CURL}}

Headers:
{{RESPONSE_HEADERS_BLOCK}}

Expected:
200 OK or 204 No Content
Allow: GET, POST, OPTIONS

Severity:
Low (Protocol Compliance)

Fix:
Ensure OPTIONS handlers automatically return 200/204 with Allow header.`,
  [UNSUPPORTED_METHOD_TEST_NAME]: `BUG REPORT – Incorrect Handling of Unsupported HTTP Methods

The API returns an incorrect status when an unsupported HTTP method is used.
Instead of 405 Method Not Allowed or 501 Not Implemented, it returns anotherstatus code (e.g., 404 or 403).

Why it's a bug:
HTTP standards require:
- 405 Method Not Allowed + Allow header
or:
- 501 Not Implemented

Incorrect responses:
- Mislead developers
- Mask routing/method issues
- Break API client behavior

Request:
{{CURL}}

Headers:
{{RESPONSE_HEADERS_BLOCK}}

Expected:
405 Method Not Allowed
Allow: GET, POST, OPTIONS
OR
501 Not Implemented

Severity:
Low (Protocol Compliance)

Fix:
Configure routing/middleware to correctly return 405 or 501.`,
  [AUTHORIZATION_TEST_NAME]: `BUG REPORT – Missing Authorization Cookie/Token

The API does not return 401 Unauthorized when authentication is missing.
Instead, it returns another status (200, 400, 403), which misrepresents the real issue.

Why it's a bug:
When no token/cookie is provided, the server must return 401.
This ensures:
- Clients detect missing/expired auth
- Tools distinguish auth failures from real bugs
- No information leaks to unauthenticated callers

Request:
{{CURL}}

Headers:
{{RESPONSE_HEADERS_BLOCK}}

Expected:
401 Unauthorized
WWW-Authenticate: Bearer

Severity:
Low (Security Hardening)

Fix:
Update authentication middleware to always return 401 for missing tokens.`,
  [NOT_FOUND_TEST_NAME]: `BUG REPORT – Incorrect 404 Handling for Non-Existing Resource

The API does not return 404 Not Found when requesting an invalid path.
Instead, it returns a different status (200, 400, 401, 403), misleading clients.

Why it's a bug:404 ensures:
- Clear separation of routing issues vs. auth or logic bugs
- Predictable behavior across environments
- No accidental exposure of internal routing

Request:
{{CURL}}

Headers:
{{RESPONSE_HEADERS_BLOCK}}

Expected:
404 Not Found

Severity:
Low (Protocol Compliance)

Fix:
Enable default 404 routing handlers and ensure they trigger for invalid paths.`,
  [REFLECTED_PAYLOAD_SAFETY_TEST_NAME]: `BUG REPORT – Reflected Payload Safety Failure

The API reflects user-supplied garbage payloads back in the response
or returns an incorrect status code (e.g., 403 or 200) instead of validating input.

Why it's a bug:
When sending intentionally invalid payload data, the server must:
- Reject it with 400 Bad Request or 422 Unprocessable Entity
- Never echo back user-provided garbage
- Never process or authorize the request

Reflection of input is a known security risk.

Request:
{{CURL}}

Headers:
{{RESPONSE_HEADERS_BLOCK}}

Expected:
400 Bad Request or 422 Unprocessable Entity
No reflected payload in the response body.

Severity:Medium (Validation & Security Hygiene)

Fix:
Improve request body validation and ensure no user input is reflected.`,
  [UPPERCASE_DOMAIN_TEST_NAME]: `BUG REPORT – Incorrect Handling of Uppercase Domain

The API returns an error when the request is sent with the domain written in UPPERCASE.
For example, changing:
api.example.com
to:
API.EXAMPLE.COM
results in a non-2xx response.

Why it's a bug:
According to DNS standards, **domain names are case-insensitive**.
This means:

API.EXAMPLE.COM
api.example.com
Api.Example.Com

…must all resolve and behave identically.

If the server returns 400, 403, 404, or 500 when the domain is uppercase, it indicates incorrect host handling, misconfigured routing, or case-sensitive matching somewhere in the stack.

This leads to:

- Unpredictable behavior across environments
- Incorrect gateway or reverse-proxy configuration
- Failures in automated tools or load balancers
- Hard-to-debug issues (especially in local/test setups)
- Breaks interoperability with standard HTTP clients

**Any valid request with the same host, regardless of case, must return 2xx if the original lowercase version returns 2xx.**

Request:
{{CURL}}

Headers:
{{RESPONSE_HEADERS_BLOCK}}

Expected:
2xx Success Response
The API should treat uppercase and lowercase domains as identical.

Requirements:
- Domain resolution must be case-insensitive
- No routing or middleware should depend on case-sensitive host matching
- Uppercase variants should behave exactly like the original hostname

Severity:
Low (Protocol Compliance & Platform Reliability)

Fix:
Update the gateway or server configuration so the Host header is normalized to lowercase before routing.
Most frameworks allow enabling case-insensitive host matching or normalizing hostnames automatically.`,
  [UPPERCASE_PATH_TEST_NAME]: `BUG REPORT – Incorrect Uppercase Path Handling

The API does not return 404 Not Found when the path segment is sent in UPPERCASE.
Instead, it returns a different status code (e.g., 200, 401, 403, or 500), which misleads
clients about what is actually wrong.

Why it's a bug:
For a well-formed but incorrect path (e.g., /v1/CUSTOMERS when only /v1/customers exists),the server must return 404 Not Found.

If uppercasing the last path segment changes the behavior to:
- 403 Forbidden → developers start debugging permissions
- 401 Unauthorized → developers start debugging auth
- 500 Internal Server Error → indicates fragile routing / handler logic
- 200 OK → hides the fact that routing is case-sensitive and inconsistent

This breaks basic expectations:
- Path matching becomes case-sensitive in unpredictable ways
- Clients cannot reliably detect routing mistakes
- Debugging becomes much harder when casing typos are interpreted as auth or permission issues

Request:
{{CURL}}

Headers:
{{RESPONSE_HEADERS_BLOCK}}

Expected:
404 Not Found
A clear routing error, indicating that the resource with that exact path does not exist.

Requirements:
- Status must be 404 for invalid path variants (e.g., wrong case in last segment)
- No authentication or business logic should run before returning 404
- Error message should clearly state the resource was not found

Severity:
Low (Protocol Compliance & Developer Experience)

Fix:
Update routing / middleware so that:
- Only the correct path casing is treated as a valid route
- Any invalid variant (including UPPERCASE last segment) immediately returns 404
- No auth or business logic is executed for non-existent routes`,
  [LARGE_PAYLOAD_TEST_NAME]: `BUG REPORT – Incorrect Handling of Large Payloads

The API does not return 413 Payload Too Large when a request body exceeds acceptable size limits.
Instead, it returns a different status code (e.g., 200, 400, 401, 403, or even processes the payload),
which indicates the server is *attempting to handle* a request it should reject immediately.

Why it's a bug:
Large payload handling is a core part of API hardening. When a request body is excessively large
(e.g., 10 MB by default in this test), the server must reject it *before* parsing or processing it.

Failing to return 413 Payload Too Large causes:

- **Resource waste:** server tries to parse multi-MB junk payloads
- **Potential DoS vectors:** attackers can send huge bodies repeatedly to exhaust CPU/memory
- **Inconsistent behavior:** clients cannot reliably detect size limits
- **Security issues:** upstream gateways normally enforce size limits to prevent abuse

400 Bad Request is NOT correct.
401 or 403 are completely misleading.
200 is obviously wrong.

The correct and only standard-compliant response is **413 Payload Too Large**.

Request:
{{CURL}}

Headers:
{{RESPONSE_HEADERS_BLOCK}}

Expected:
413 Payload Too Large
The server should reject oversized bodies *before* touching business logic, validation, or auth.

Requirements:
- Status must be 413 whenever payload size exceeds allowed server or gateway limits
- No parsing, validation, or authentication should occur on oversized bodies
- Error message should clearly describe payload size limits

Severity:
Medium (Security Hardening & DoS Prevention)

Fix:
Configure request size limits at the API gateway, reverse proxy, or framework level so that:
- Oversized payloads are rejected immediately with 413
- No downstream handlers are invoked
- Logging includes payload size rejection events`,
};
