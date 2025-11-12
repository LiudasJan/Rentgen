import { Method } from 'axios';
import { Test, TestStatus } from '../types';
import {
  encodeMessage,
  generateRandomEmail,
  generateRandomInteger,
  generateRandomString,
  setDeepObjectProperty,
} from '../utils';

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

  // Manual performance tests (require human verification) ---
  results.push({
    actual: '', // Empty until test is executed
    expected: `Median <${EXCELLENT_RESPONSE_TIME_MS} ms (Pass), <${ACCEPTABLE_RESPONSE_TIME_MS} ms (Warning), ≥${ACCEPTABLE_RESPONSE_TIME_MS} ms (Fail)`,
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

export async function runLoadTest(
  method: Method,
  url: string,
  headers: Record<string, string>,
  body: string,
  fieldMappings: Record<string, string>,
  messageType: string,
  protoFile: File | null,
  threadCount: number,
  requestCount: number,
  maybeUpdateProgressUI: (sentCount: number, loadRequestCount: number) => void,
): Promise<Test> {
  const concurrency = Math.max(1, Math.min(100, Math.floor(threadCount)));
  const total = Math.max(1, Math.min(10000, Math.floor(requestCount)));

  let parsedBody: any = null;
  try {
    parsedBody = body ? JSON.parse(body) : null;
  } catch {
    // jei ne JSON – siunčiam raw (be randomizacijos)
    parsedBody = null;
  }

  let sent = 0;
  let failures5xx = 0;
  let failures4xx = 0;
  const times: number[] = [];

  let abort = false;

  async function oneRequest() {
    if (abort) return;

    // kūnas: originalus + random laukai, lygiai kaip data-driven cikle
    let dataToSend: any = parsedBody ? buildRandomizedBody(parsedBody, fieldMappings) : body;

    if (protoFile && messageType && parsedBody) {
      try {
        dataToSend = encodeMessage(messageType, dataToSend);
      } catch (e) {
        // jei nepavyko encodinti – skaitom kaip fail'ą
        failures5xx++;
        return;
      }
    }

    const t0 = performance.now();
    const res = await window.electronAPI.sendHttp({
      url,
      method,
      headers,
      body: dataToSend,
    });
    const t1 = performance.now();

    const ms = t1 - t0;
    times.push(ms);

    const code = codeOf(res);
    if (code >= 500) failures5xx++;
    if (code >= 400 && code < 500) failures4xx++;

    // ankstyvas stabdymas: >5 5xx arba mediana > 5000ms
    if (failures5xx >= 5) abort = true;
    if (times.length >= Math.min(10, total)) {
      const med = percentile(times, 50);
      if (med > 5000) abort = true;
    }
  }

  async function worker() {
    while (!abort) {
      const myIdx = sent++;
      if (myIdx >= total) break;
      await oneRequest();

      // 🆕 po kiekvieno request'o — progress
      maybeUpdateProgressUI(myIdx + 1, requestCount);
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, total) }, worker);
  await Promise.all(workers);

  // suformuojam rezultatą Performance lentelei
  const p50 = percentile(times, 50);
  const p90 = percentile(times, 90);
  const p95 = percentile(times, 95);
  const avg = times.length ? times.reduce((a, b) => a + b, 0) / times.length : 0;

  const status =
    failures5xx >= 5
      ? TestStatus.Fail
      : p50 < 500
        ? TestStatus.Pass
        : p50 < 1000
          ? TestStatus.Warning
          : TestStatus.Fail;

  return {
    actual: `${concurrency} threads, ${total} total req. Executed: ${times.length} req → p50=${p50.toFixed(0)}ms p90=${p90.toFixed(0)}ms p95=${p95.toFixed(0)}ms avg=${avg.toFixed(0)}ms, 4xx=${failures4xx}, 5xx=${failures5xx}`,
    expected: `Median <${EXCELLENT_RESPONSE_TIME_MS} ms (Pass), <${ACCEPTABLE_RESPONSE_TIME_MS} ms (Warning), ≥${ACCEPTABLE_RESPONSE_TIME_MS} ms (Fail)`,
    name: 'Load test',
    status,
  };
}

function buildRandomizedBody(baseBody: any, fieldMappings: Record<string, string>) {
  const newBody = JSON.parse(JSON.stringify(baseBody));

  // perrašom visus random laukus kiekvienam request'ui
  for (const [f, t] of Object.entries(fieldMappings)) {
    if (t === 'random32') setDeepObjectProperty(newBody, f, generateRandomString());
    if (t === 'randomInt') setDeepObjectProperty(newBody, f, generateRandomInteger());
    if (t === 'randomEmail') setDeepObjectProperty(newBody, f, generateRandomEmail());
  }

  return newBody;
}

// status code paėmimas
function codeOf(res: any): number {
  const s = (res?.status || '').toString();
  const n = parseInt(s.split(' ')[0] || '0', 10);
  return Number.isFinite(n) ? n : 0;
}

// percentiliai
function percentile(values: number[], p: number) {
  if (!values.length) return 0;
  const arr = [...values].sort((a, b) => a - b);
  const idx = Math.min(arr.length - 1, Math.max(0, Math.floor((p / 100) * arr.length)));
  return arr[idx];
}
