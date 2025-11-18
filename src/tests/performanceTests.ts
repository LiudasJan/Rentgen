import { NOT_AVAILABLE_TEST } from '.';
import { RESPONSE_STATUS } from '../constants/responseStatus';
import { Test } from '../decorators';
import { TestOptions, TestResult, TestStatus } from '../types';
import { calculateMedian, calculatePercentile, createTestHttpRequest, extractStatusCode } from '../utils';

export const LOAD_TEST_NAME = 'Load test';

const EXCELLENT_RESPONSE_TIME_MS = 500;
const ACCEPTABLE_RESPONSE_TIME_MS = 1000;
const MAX_PING_LATENCY_MS = 100;
const PING_TEST_COUNT = 5;
const MAX_ACCEPTABLE_BAD_PINGS = 3;
const EXPECTED_RATE_LIMIT_STATUS = '429 Too Many Requests';

const MAX_CONCURRENCY = 100;
const MAX_TOTAL_REQUESTS = 10000;
const MAX_EARLY_ABORT_FAILURES = 5;
const EARLY_ABORT_RESPONSE_TIME_MS = 5000;
const MIN_REQUESTS_FOR_ABORT_CHECK = 10;

export class PerformanceInsights {
  constructor(
    private url: string,
    private testResults: TestResult[],
    protected onTestStart?: () => void,
  ) {
    this.url = url;
    this.testResults = testResults;
  }

  public async run(): Promise<TestResult[]> {
    const results: TestResult[] = [];

    results.push(this.testMedianResponseTime(), await this.testNetworkPingLatency(), ...getManualTests());

    return results;
  }

  @Test('Calculates the median response time from load test results')
  private testMedianResponseTime(): TestResult {
    this.onTestStart?.();

    const responseTimes = this.testResults.map((result: TestResult) => result.responseTime).filter(Boolean);
    const medianResponseTime = calculateMedian(responseTimes);

    let responseTimeStatus = TestStatus.Fail;
    if (medianResponseTime <= EXCELLENT_RESPONSE_TIME_MS) responseTimeStatus = TestStatus.Pass;
    else if (medianResponseTime <= ACCEPTABLE_RESPONSE_TIME_MS) responseTimeStatus = TestStatus.Warning;

    return {
      actual: `${medianResponseTime.toFixed(0)} ms`,
      expected: `<= ${EXCELLENT_RESPONSE_TIME_MS} ms`,
      name: 'Median response time',
      status: responseTimeStatus,
    };
  }

  @Test('Tests network ping latency')
  private async testNetworkPingLatency(): Promise<TestResult> {
    this.onTestStart?.();

    try {
      const targetDomain = new URL(this.url).hostname;
      const pingResults: number[] = [];

      for (let i = 0; i < PING_TEST_COUNT; i++) {
        const pingTime = await window.electronAPI.pingHost(targetDomain);
        pingResults.push(pingTime);
      }

      const highLatencyCount = pingResults.filter((pingTime) => pingTime > MAX_PING_LATENCY_MS).length;
      const averagePingTime = pingResults.reduce((sum, pingTime) => sum + pingTime, 0) / pingResults.length;
      const pingLatencyStatus = highLatencyCount >= MAX_ACCEPTABLE_BAD_PINGS ? TestStatus.Fail : TestStatus.Pass;

      return {
        actual: `${averagePingTime.toFixed(0)} ms (high latency ${highLatencyCount}/${PING_TEST_COUNT})`,
        expected: `<= ${MAX_PING_LATENCY_MS} ms (${MAX_ACCEPTABLE_BAD_PINGS}/${PING_TEST_COUNT} rule)`,
        name: 'Ping latency',
        status: pingLatencyStatus,
      };
    } catch (error) {
      return {
        actual: `Unexpected error: ${String(error)}`,
        expected: 'Ping should succeed',
        name: 'Ping test error',
        status: TestStatus.Bug,
      };
    }
  }
}

function getManualTests(): TestResult[] {
  return [
    {
      actual: '', // Empty until test is executed
      expected: `Median <${EXCELLENT_RESPONSE_TIME_MS} ms (Pass), <${ACCEPTABLE_RESPONSE_TIME_MS} ms (Warning), ≥${ACCEPTABLE_RESPONSE_TIME_MS} ms (Fail)`,
      name: LOAD_TEST_NAME,
      status: TestStatus.Manual, // Requires manual execution
    },
    {
      actual: NOT_AVAILABLE_TEST,
      expected: EXPECTED_RATE_LIMIT_STATUS,
      name: 'Rate limiting implementation',
      status: TestStatus.Manual,
    },
  ];
}

export async function runLoadTest(
  options: TestOptions,
  threadCount: number,
  requestCount: number,
  updateProgress?: (sentRequestCount: number, requestCount: number) => void,
): Promise<TestResult> {
  const concurrency = Math.max(1, Math.min(MAX_CONCURRENCY, Math.floor(threadCount)));
  const totalRequests = Math.max(1, Math.min(MAX_TOTAL_REQUESTS, Math.floor(requestCount)));
  const responseTimes: number[] = [];

  let requestsSent = 0,
    server5xxFailures = 0,
    client4xxFailures = 0,
    isAborted = false;

  async function executeSingleRequest(): Promise<void> {
    if (isAborted) return;

    const request = createTestHttpRequest(options);
    const requestStartTime = performance.now();
    const response = await window.electronAPI.sendHttp(request);
    const responseTime = performance.now() - requestStartTime;
    responseTimes.push(responseTime);

    const statusCode = extractStatusCode(response);
    if (statusCode >= RESPONSE_STATUS.SERVER_ERROR) server5xxFailures++;
    if (statusCode >= RESPONSE_STATUS.CLIENT_ERROR && statusCode < RESPONSE_STATUS.SERVER_ERROR) client4xxFailures++;

    // Check early abort conditions
    if (server5xxFailures >= MAX_EARLY_ABORT_FAILURES) isAborted = true;
    if (responseTimes.length >= Math.min(MIN_REQUESTS_FOR_ABORT_CHECK, totalRequests)) {
      const medianResponseTime = calculatePercentile(responseTimes, 50);
      if (medianResponseTime > EARLY_ABORT_RESPONSE_TIME_MS) isAborted = true;
    }
  }

  async function workerThread(): Promise<void> {
    while (!isAborted) {
      const currentRequestIndex = requestsSent++;
      if (currentRequestIndex >= totalRequests) break;

      await executeSingleRequest();

      // Report progress after each request
      updateProgress?.(currentRequestIndex + 1, requestCount);
    }
  }

  // Execute concurrent worker threads
  const workers = Array.from({ length: Math.min(concurrency, totalRequests) }, workerThread);
  await Promise.all(workers);

  // Calculate performance percentiles
  const p50 = calculatePercentile(responseTimes, 50);
  const p90 = calculatePercentile(responseTimes, 90);
  const p95 = calculatePercentile(responseTimes, 95);
  const averageResponseTime =
    responseTimes.length > 0 ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length : 0;
  const testStatus =
    server5xxFailures >= MAX_EARLY_ABORT_FAILURES
      ? TestStatus.Fail
      : p50 < EXCELLENT_RESPONSE_TIME_MS
        ? TestStatus.Pass
        : p50 < ACCEPTABLE_RESPONSE_TIME_MS
          ? TestStatus.Warning
          : TestStatus.Fail;

  return {
    actual: `${concurrency} threads, ${totalRequests} total req. Executed: ${responseTimes.length} req → p50=${p50.toFixed(0)}ms p90=${p90.toFixed(0)}ms p95=${p95.toFixed(0)}ms avg=${averageResponseTime.toFixed(0)}ms, 4xx=${client4xxFailures}, 5xx=${server5xxFailures}`,
    expected: `Median <${EXCELLENT_RESPONSE_TIME_MS} ms (Pass), <${ACCEPTABLE_RESPONSE_TIME_MS} ms (Warning), ≥${ACCEPTABLE_RESPONSE_TIME_MS} ms (Fail)`,
    name: LOAD_TEST_NAME,
    status: testStatus,
  };
}
