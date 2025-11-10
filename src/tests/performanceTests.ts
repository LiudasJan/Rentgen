import { Test, TestStatus } from '../types';

const EXCELLENT_RESPONSE_TIME_MS = 500;
const ACCEPTABLE_RESPONSE_TIME_MS = 1000;
const MAX_PING_LATENCY_MS = 100;
const PING_TEST_COUNT = 5;
const MAX_ACCEPTABLE_BAD_PINGS = 3;
const EXPECTED_RATE_LIMIT_STATUS = '429 Too Many Requests';

export async function runPerformanceInsights(url: string, testResults: Test[]): Promise<Test[]> {
  const results: Test[] = [];

  // Calculate response time median from test results
  const responseTimes = testResults.map((result: Test) => result.responseTime).filter(Boolean);
  const medianResponseTime = median(responseTimes);

  let responseTimeStatus = TestStatus.Fail;
  if (medianResponseTime <= EXCELLENT_RESPONSE_TIME_MS) responseTimeStatus = TestStatus.Pass;
  else if (medianResponseTime <= ACCEPTABLE_RESPONSE_TIME_MS) responseTimeStatus = TestStatus.Warning;

  results.push({
    actual: `${medianResponseTime.toFixed(0)} ms`,
    expected: `<= ${EXCELLENT_RESPONSE_TIME_MS} ms`,
    name: 'Median response time',
    status: responseTimeStatus,
  });

  // Test network ping latency to the target host
  try {
    const targetDomain = new URL(url).hostname;
    const pingResults: number[] = [];

    for (let i = 0; i < PING_TEST_COUNT; i++) {
      const pingTime = await window.electronAPI.pingHost(targetDomain);
      pingResults.push(pingTime);
    }

    const highLatencyCount = pingResults.filter((pingTime) => pingTime > MAX_PING_LATENCY_MS).length;
    const averagePingTime = pingResults.reduce((sum, pingTime) => sum + pingTime, 0) / pingResults.length;
    const pingLatencyStatus = highLatencyCount >= MAX_ACCEPTABLE_BAD_PINGS ? TestStatus.Fail : TestStatus.Pass;

    results.push({
      actual: `${averagePingTime.toFixed(0)} ms (high latency ${highLatencyCount}/${PING_TEST_COUNT})`,
      expected: `<= ${MAX_PING_LATENCY_MS} ms (${MAX_ACCEPTABLE_BAD_PINGS}/${PING_TEST_COUNT} rule)`,
      name: 'Ping latency',
      status: pingLatencyStatus,
    });
  } catch (error) {
    results.push({
      actual: String(error),
      expected: 'Ping should succeed',
      name: 'Ping test error',
      status: TestStatus.Fail,
    });
  }

  // --- Manual performance tests (require human verification) ---
  results.push({
    expected: `Median <${EXCELLENT_RESPONSE_TIME_MS} ms (Pass), <${ACCEPTABLE_RESPONSE_TIME_MS} ms (Warning), ≥${ACCEPTABLE_RESPONSE_TIME_MS} ms (Fail)`,
    actual: '', // Empty until test is executed
    name: 'Load test',
    status: TestStatus.Manual, // Requires manual execution
  });

  results.push({
    actual: 'Not available yet',
    expected: EXPECTED_RATE_LIMIT_STATUS,
    name: 'Rate limiting implementation',
    status: TestStatus.Manual,
  });

  return results;
}

function median(values: number[]): number {
  if (values.length === 0) return 0;

  const sortedValues = [...values].sort((a, b) => a - b);
  const middleIndex = Math.floor(sortedValues.length / 2);

  return sortedValues.length % 2 !== 0
    ? sortedValues[middleIndex]
    : (sortedValues[middleIndex - 1] + sortedValues[middleIndex]) / 2;
}
