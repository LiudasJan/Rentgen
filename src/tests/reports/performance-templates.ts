import {
  MEDIAN_RESPONSE_TIME_TEST_NAME,
  NETWORK_LATENCY_DOMINATES_RESPONSE_TIME_TEST_NAME,
  PING_LATENCY_TEST_NAME,
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
  [NETWORK_LATENCY_DOMINATES_RESPONSE_TIME_TEST_NAME]: `PERFORMANCE INSIGHT – Network Latency Dominates Response Time

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
};
