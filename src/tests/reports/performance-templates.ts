import {
  LOAD_TEST_NAME,
  MEDIAN_RESPONSE_TIME_TEST_NAME,
  NETWORK_SHARE_TEST_NAME,
  PING_LATENCY_TEST_NAME,
  RESPONSE_SIZE_CHECK_TEST_NAME,
} from '../PerformanceInsights';

export const performanceTemplates: Record<string, string> = {
  [MEDIAN_RESPONSE_TIME_TEST_NAME]: `BUG REPORT – Slow Median Response Time (Performance Degradation)

During sequential (non-load) API checks, the median response time exceeded recommended performance baselines.
This indicates that the API is responding **slower than expected even without any concurrency**, suggesting an inherent performance bottleneck.

Why it's a bug:
These tests run strictly **one request at a time**, with no parallel load.
So when the median response time is slow, it means:

- The endpoint has inefficient processing or heavy internal operations
- Latency is caused by the API itself, not external stress
- Even light traffic could degrade user experience
- The issue will worsen under real-world loads or spikes

Industry guidelines for transactional APIs recommend:

- **Median ≤ 200–300 ms** → Healthy
- **Median ≤ 500 ms** → Acceptable but requires review (warning)
- **Median > 500 ms** → Performance concern (yellow flag)
- **Median > 1000 ms** → Significant degradation (red flag)

Since this was detected under *simple sequential testing*, it suggests something is fundamentally slow in:

- Database queries
- Internal service calls
- Serialization/deserialization
- Heavy synchronous logic
- Misconfigured gateway or cold start behavior

Request Pattern:
Sequential single requests were executed against the same endpoint (not a load test).

Observed:
Median Response Time: {{MEDIAN_MS}}
Threshold Breached: {{YELLOW_OR_RED}}

Expected:
A stable median response time well below 500 ms for typical REST API operations.

Severity:
Medium (Performance / Scalability Risk)

Why severity is medium:
- Performance degradation affects user experience and system scalability
- This will become a critical issue once traffic increases
- Fixing early is significantly cheaper than tuning late in production

Fix:
Investigate and optimize the slowest components in the request pipeline:
1. **Profile internal handlers** (DB queries, ORM overhead, synchronous waits)
2. **Enable caching** for static or repeated data
3. **Check N+1 queries** or unnecessary round-trips
4. **Optimize serialization logic**
5. **Review gateway timeouts and routing delays**
6. **Add metrics** to isolate bottlenecks

A healthy API should stay comfortably below the warning threshold during sequential testing.`,
  [PING_LATENCY_TEST_NAME]: `BUG REPORT – High Network Latency (Ping Test Failure)

The API endpoint shows consistently high ping latency.
Out of 5 ping attempts, at least 3 exceeded the acceptable threshold of **100 ms**, triggering the 3/5 failure rule.

Why it's a bug:
Ping represents the *raw network round-trip time* before any backend logic is executed.
Even gamers monitor ping, because high latency means the connection itself is slow — and API users feel the same pain.

When ping is high:

- Requests will feel sluggish even if backend processing is fast
- Retries and timeouts become more likely
- Mobile clients in bad networks will experience amplified delays
- The issue compounds under load or slow connections

In API testing with Rentgen, we assume:

- The tester is near the target system (LAN/VPN/local dev env)
- No internet routing is involved unless intentionally testing remote APIs

So if ping is above 100 ms consistently in a controlled environment, something is fundamentally wrong.

Possible causes:

- Misconfigured routing or DNS
- Slow internal network hops
- Cloud region mismatch
- Overloaded or throttled gateway
- Packet loss or congestion on internal links

Request:
n/a — this test uses 5 raw ICMP-equivalent probes (no payload processing).

Results:
Ping samples: {{PING}} ms
At least 3 were > 100 ms → threshold breached.

Expected:
Most pings should be well below 100 ms in any healthy internal environment.

Requirements:
- 3 out of 5 pings must be ≤ 100 ms (3/5 rule)
- No major spikes unless testing remote geographies
- Stable and predictable latencySeverity:Medium (Network Health / Developer Experience)

Fix:
- Verify routing paths and DNS resolution
- Check API gateway performance
- Ensure the service and client are in the same region or network zone
- Eliminate unnecessary load balancer hops
- Investigate packet loss or throttling on internal networking equipment

Stable low latency (< 100 ms) is foundational for a responsive API — failures here affect everything built on top of it.`,
  [NETWORK_SHARE_TEST_NAME]: `PERFORMANCE INSIGHT – Network Latency Dominates Response Time

Rentgen compared the API response time with raw network latency (ping).
A large portion of the total response time is spent just traveling over the network, not in the backend.

How we calculated it:
- Best ping: {{BEST_PING_MS}} ms
- Median response time: {{MEDIAN_RESPONSE_MS}} ms
- Network share: (ping / response) ≈ {{RATIO_PERCENT}}%

Why it matters:
If network latency takes 30–50%+ of the total time, it usually means:
- The API is hosted far from the client or test environment
- There are too many hops (VPN / proxy / WAF / CDN chain)
- Even a fast backend feels “slow” because most time is spent on the wire

This is not a backend performance bug, but a strong signal to check:
- Where the API is hosted vs where tests are executed
- Routing, VPN, proxy, and CDN configuration

Request sample:
{{CURL}}

Ping sample:
{{PING_RESULTS_BLOCK}}

Severity:Info / Warning (Performance Insight)

Suggested next steps:
- Run ping / traceroute from the same environment where Rentgen is running
- Check if the API can be moved closer to the client or test infra
- Review network path (VPN, proxies, WAF, CDN) to reduce latency`,
  [LOAD_TEST_NAME]: `BUG REPORT – Load Test Performance Degradation

The API shows degraded performance under minimal concurrent load.
During a lightweight load test ({{threads}} threads, {{requests}} requests), the median and high-percentile latencies exceeded acceptable performance thresholds.

Why it’s a bug:
Even small amounts of parallel traffic should not push API latency into the 500–1000 ms range. This indicates potential issues such as:

- Inefficient middleware or routing
- Slow database queries
- Insufficient caching
- N+1 patterns or unoptimized business logic
- Thread/connection pool saturation

RENTGEN’s performance thresholds:
- Median <500 ms → Pass
- Median <1000 ms → Warning
- Median ≥1000 ms → Fail

Crossing into Warning/Fail territory even with low load suggests the system may not scale reliably when real traffic increases.

Request:
{{CURL}}

Response Time Metrics:
{{RESPONSE_PERF_BLOCK}}

Expected:
Median latency <500 ms under minimal concurrency ({{threads}} threads, {{requests}} requests).
p50 percentile value should remain well below 500 ms.

Requirements:
- Median, p50 should not degrade under low load
- No 5xx or connection drops
- Latency stability across repeated runs

Severity:
Medium (Scalability & Performance Reliability)

Fix:
Review performance bottlenecks by:
- Profiling slow endpoints
- Checking DB query execution plans
- Implementing caching where possible
- Ensuring proper connection/thread pool sizing
- Reviewing middleware for synchronous blocking operations`,
  [RESPONSE_SIZE_CHECK_TEST_NAME]: `BUG REPORT – Excessive JSON Response Size

Summary
One or more API endpoints return an excessively large JSON response.
At least one response body exceeds 100 KB, which negatively impacts performance,scalability, and client usability.

This issue was detected during normal API requests (no additional test requests were made).

Why it's a bug:
Large JSON responses are almost never accidental and usually indicate poor API design.

Excessive response sizes cause multiple real-world problems:
- Increased latency (especially on mobile or slow networks)
- Higher memory usage on clients
- Slower parsing and rendering
- Unnecessary bandwidth costs
- Harder caching and pagination strategies
- Tightly coupled clients that depend on oversized payloads

In most cases, large responses mean:
- Overfetching (too many fields returned by default)
- Missing pagination
- Missing filtering (e.g., fields, includes, excludes)
- Debug or internal fields leaking into public responses
- Endpoints doing “data dumps” instead of serving a clear contract

APIs should return only what the client actually needs.
Anything else is technical debt disguised as convenience.

Reproduction Steps:
1) Execute the API request normally.
2) Inspect the response body size.
3) Observe that the JSON response exceeds the recommended size limit.

No special setup or repeated requests are required.

Request:
{{CURL}}

Observed:
- Response Content-Type: application/json
- Response Body Size: {{RESPONSE_SIZE}} KB
- Limit: 100 KB

Expected:
The API should return a JSON response that is:
- Smaller than 100 KB
- Focused on the specific use case
- Optimized for client consumption

If large datasets are required, the API should provide:
- Pagination
- Field filtering
- Explicit expansion parameters

Requirements:
- JSON responses should not exceed 100 KB by default
- Large collections must be paginated
- Clients must be able to request only required fields
- Internal or debug fields must not be exposed
- API contracts should favor small, predictable payloads

Severity:
Medium (Performance, Scalability & API Design)

Fix:
Consider one or more of the following:
- Add pagination (limit / offset, cursor-based pagination, etc.)
- Introduce field filtering (e.g., ?fields=id,name,status)
- Split large endpoints into smaller, purpose-driven endpoints
- Remove unused, redundant, or internal fields from responses
- Avoid returning nested objects by default unless explicitly requested

As a rule of thumb:
If a response “looks big”, it probably is.
APIs should be designed to return minimal, intentional data — not everything.

Notes:
This is a design and quality issue, not a functional failure.
The endpoint may work correctly, but its current response size creates long-term performance and maintenance risks.`,
};
