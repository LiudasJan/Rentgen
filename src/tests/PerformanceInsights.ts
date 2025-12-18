import { getResponseStatusTitle, RESPONSE_STATUS } from '../constants/responseStatus';
import { Abortable, Test } from '../decorators';
import { HttpRequest, HttpResponse, TestOptions, TestResult, TestStatus } from '../types';
import {
  calculateMedian,
  calculatePercentile,
  createTestHttpRequest,
  extractStatusCode,
  getHeaderValue,
} from '../utils';
import { BaseTests, createErrorTestResult, createTestResult, NOT_AVAILABLE_TEST } from './BaseTests';

export const LOAD_TEST_NAME = 'Load Test';
export const MEDIAN_RESPONSE_TIME_TEST_NAME = 'Median Response Time';
export const NETWORK_SHARE_TEST_NAME = 'Network Share Calculation';
export const PING_LATENCY_TEST_NAME = 'Ping Latency';
export const RESPONSE_SIZE_CHECK_TEST_NAME = 'Response Size Check';

const EXCELLENT_RESPONSE_TIME_MS = 500;
const ACCEPTABLE_RESPONSE_TIME_MS = 1000;
const MAX_PING_LATENCY_MS = 100;
const PING_TEST_COUNT = 5;
const MAX_ACCEPTABLE_BAD_PINGS = 3;
const EXPECTED_RATE_LIMIT_STATUS = `${RESPONSE_STATUS.TOO_MANY_REQUESTS} ${getResponseStatusTitle(RESPONSE_STATUS.TOO_MANY_REQUESTS)}`;

const MAX_CONCURRENCY = 100;
const MAX_TOTAL_REQUESTS = 10000;
const MAX_EARLY_ABORT_FAILURES = 5;
const EARLY_ABORT_RESPONSE_TIME_MS = 5000;
const MIN_REQUESTS_FOR_ABORT_CHECK = 10;

const NETWORK_SHARE_RESPONSE_TIME_MS = 300;
const NETWORK_SHARE_PASS_THRESHOLD = 30;
const NETWORK_SHARE_WARNING_THRESHOLD = 50;

const RESPONSE_SIZE_KB = 100;

export class PerformanceInsights extends BaseTests {
  private url: string;

  constructor(
    private testResults: TestResult[],
    protected options: TestOptions,
    protected onTestStart?: () => void,
  ) {
    super(options, onTestStart);

    this.url = options.url;
    this.testResults = testResults;
    this.onTestStart = onTestStart;
  }

  public async run(): Promise<TestResult[]> {
    const results: TestResult[] = [];
    const medianTestResult = this.testMedianResponseTime();
    const pingTestResult = await this.testNetworkPingLatency();
    const pingTimes = pingTestResult.value as number[];
    const bestPingTime = pingTimes?.length > 0 ? Math.min(...pingTimes) : null;

    results.push(
      medianTestResult,
      pingTestResult,
      this.testNetworkSharing(medianTestResult.responseTime, bestPingTime),
      this.testResponseSize(),
      ...getManualTests(),
    );

    return results;
  }

  @Abortable
  @Test('Calculates the median response time from load test results')
  private testMedianResponseTime(): TestResult {
    this.onTestStart?.();

    const responseTimes = this.testResults.map((result: TestResult) => result.responseTime).filter(Boolean);
    const medianResponseTime = calculateMedian(responseTimes);

    let status = TestStatus.Fail;
    if (medianResponseTime <= EXCELLENT_RESPONSE_TIME_MS) status = TestStatus.Pass;
    else if (medianResponseTime <= ACCEPTABLE_RESPONSE_TIME_MS) status = TestStatus.Warning;

    return createTestResult(
      MEDIAN_RESPONSE_TIME_TEST_NAME,
      `<= ${EXCELLENT_RESPONSE_TIME_MS} ms`,
      `${medianResponseTime.toFixed(0)} ms`,
      status,
      null,
      null,
      medianResponseTime,
    );
  }

  @Abortable
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

      return createTestResult(
        PING_LATENCY_TEST_NAME,
        `<= ${MAX_PING_LATENCY_MS} ms (${MAX_ACCEPTABLE_BAD_PINGS}/${PING_TEST_COUNT} rule)`,
        `${averagePingTime.toFixed(0)} ms (high latency ${highLatencyCount}/${PING_TEST_COUNT})`,
        highLatencyCount >= MAX_ACCEPTABLE_BAD_PINGS ? TestStatus.Fail : TestStatus.Pass,
        null,
        null,
        0,
        pingResults,
      );
    } catch (error) {
      return createErrorTestResult(PING_LATENCY_TEST_NAME, 'Ping Succeeds', String(error));
    }
  }

  @Abortable
  @Test('Detects when network latency (ping) consumes a significant portion of the total API response time')
  private testNetworkSharing(medianResponseTime: number, pingTime: number | null): TestResult {
    this.onTestStart?.();

    if (pingTime === null)
      return createTestResult(NETWORK_SHARE_TEST_NAME, `< ${NETWORK_SHARE_PASS_THRESHOLD}%`, '', TestStatus.Manual);

    const hostname = new URL(this.url).hostname;
    const ratioPercent = (pingTime / medianResponseTime) * 100;

    let status = TestStatus.Fail;
    if (ratioPercent < NETWORK_SHARE_PASS_THRESHOLD || medianResponseTime < NETWORK_SHARE_RESPONSE_TIME_MS)
      status = TestStatus.Pass;
    else if (ratioPercent < NETWORK_SHARE_WARNING_THRESHOLD) status = TestStatus.Warning;

    return createTestResult(
      NETWORK_SHARE_TEST_NAME,
      `< ${NETWORK_SHARE_PASS_THRESHOLD}% or total response time < ${NETWORK_SHARE_RESPONSE_TIME_MS} ms`,
      medianResponseTime < NETWORK_SHARE_RESPONSE_TIME_MS
        ? `${pingTime} ms (best ping time)`
        : `${ratioPercent.toFixed(2)}% (best ping time: ${pingTime} ms)`,
      status,
      null,
      null,
      0,
      { hostname, medianResponseTime, pingTime, ratioPercent },
    );
  }

  @Abortable
  @Test('Checks the size of the response payload from load test results')
  private testResponseSize(): TestResult {
    this.onTestStart?.();

    const result = this.testResults.find(({ response }) => {
      if (!response) return false;

      const contentType = getHeaderValue(response.headers, 'content-type');
      if (!contentType || !contentType.toLowerCase().includes('application/json')) return false;

      return new TextEncoder().encode(response.body).length > 100 * 1024;
    });
    const size = result ? (new TextEncoder().encode(result.response.body).length / 1024).toFixed(2) : null;

    return createTestResult(
      RESPONSE_SIZE_CHECK_TEST_NAME,
      `< ${RESPONSE_SIZE_KB} KB`,
      result ? `${size} KB` : `< ${RESPONSE_SIZE_KB} KB`,
      result ? TestStatus.Fail : TestStatus.Pass,
      result?.request,
      result?.response,
      result?.responseTime ?? 0,
      size,
    );
  }
}

function getManualTests(): TestResult[] {
  return [
    createTestResult(
      LOAD_TEST_NAME,
      `Median <${EXCELLENT_RESPONSE_TIME_MS} ms (Pass), <${ACCEPTABLE_RESPONSE_TIME_MS} ms (Warning), ≥${ACCEPTABLE_RESPONSE_TIME_MS} ms (Fail)`,
      '',
      TestStatus.Manual,
    ),
    createTestResult('Rate Limiting Implementation', EXPECTED_RATE_LIMIT_STATUS, NOT_AVAILABLE_TEST, TestStatus.Manual),
  ];
}

export async function runLoadTest(
  options: TestOptions,
  threadCount: number,
  requestCount: number,
  updateProgress?: (sentRequestCount: number, requestCount: number) => void,
): Promise<TestResult> {
  const threads = Math.max(1, Math.min(MAX_CONCURRENCY, Math.floor(threadCount)));
  const requests = Math.max(1, Math.min(MAX_TOTAL_REQUESTS, Math.floor(requestCount)));
  const responseTimes: number[] = [];

  let requestsSent = 0,
    server5xxFailures = 0,
    client4xxFailures = 0,
    isAborted = false,
    request: HttpRequest = null,
    response: HttpResponse = null;

  async function executeSingleRequest(): Promise<void> {
    if (isAborted) return;

    request = createTestHttpRequest(options);
    const requestStartTime = performance.now();
    response = await window.electronAPI.sendHttp(request);
    const responseTime = performance.now() - requestStartTime;
    responseTimes.push(responseTime);

    const statusCode = extractStatusCode(response);
    if (statusCode >= RESPONSE_STATUS.SERVER_ERROR) server5xxFailures++;
    if (statusCode >= RESPONSE_STATUS.BAD_REQUEST && statusCode < RESPONSE_STATUS.SERVER_ERROR) client4xxFailures++;

    // Check early abort conditions
    if (server5xxFailures >= MAX_EARLY_ABORT_FAILURES) isAborted = true;
    if (responseTimes.length >= Math.min(MIN_REQUESTS_FOR_ABORT_CHECK, requests)) {
      const medianResponseTime = calculatePercentile(responseTimes, 50);
      if (medianResponseTime > EARLY_ABORT_RESPONSE_TIME_MS) isAborted = true;
    }
  }

  async function workerThread(): Promise<void> {
    while (!isAborted) {
      const currentRequestIndex = requestsSent++;
      if (currentRequestIndex >= requests) break;

      await executeSingleRequest();

      // Report progress after each request
      updateProgress?.(currentRequestIndex + 1, requestCount);
    }
  }

  // Execute concurrent worker threads
  const workers = Array.from({ length: Math.min(threads, requests) }, workerThread);
  await Promise.all(workers);

  // Calculate performance percentiles
  const p50 = calculatePercentile(responseTimes, 50);
  const p90 = calculatePercentile(responseTimes, 90);
  const p95 = calculatePercentile(responseTimes, 95);
  const averageResponseTime =
    responseTimes.length > 0 ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length : 0;
  const testStatus =
    server5xxFailures >= MAX_EARLY_ABORT_FAILURES
      ? TestStatus.Bug
      : p50 < EXCELLENT_RESPONSE_TIME_MS
        ? TestStatus.Pass
        : p50 < ACCEPTABLE_RESPONSE_TIME_MS
          ? TestStatus.Warning
          : TestStatus.Fail;

  return createTestResult(
    LOAD_TEST_NAME,
    `Median <${EXCELLENT_RESPONSE_TIME_MS} ms (Pass), <${ACCEPTABLE_RESPONSE_TIME_MS} ms (Warning), ≥${ACCEPTABLE_RESPONSE_TIME_MS} ms (Fail)`,
    `${threads} threads, ${requests} total req. Executed: ${responseTimes.length} req → p50=${p50.toFixed(0)}ms p90=${p90.toFixed(0)}ms p95=${p95.toFixed(0)}ms avg=${averageResponseTime.toFixed(0)}ms, 4xx=${client4xxFailures}, 5xx=${server5xxFailures}`,
    testStatus,
    request,
    response,
    averageResponseTime,
    { threads, requests },
  );
}
