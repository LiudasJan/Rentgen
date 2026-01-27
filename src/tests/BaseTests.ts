import { RESPONSE_STATUS } from '../constants/responseStatus';
import { HttpRequest, HttpResponse, TestOptions, TestResult, TestStatus } from '../types';
import { extractStatusCode } from '../utils';

export const CLIENT_ERROR_RESPONSE_EXPECTED = '4xx';
export const NOT_AVAILABLE_TEST = 'Not Available';
export const ORIGINAL_REQUEST_TEST_PARAMETER_NAME = '[original request]';
export const SUCCESS_RESPONSE_EXPECTED = '2xx';

export abstract class BaseTests {
  private _aborted = false;

  public get aborted() {
    return this._aborted;
  }

  constructor(
    protected options: TestOptions,
    protected onTestStart?: () => void,
  ) {
    this.options = options;
    this.onTestStart = onTestStart;
  }

  public abort() {
    this._aborted = true;
  }

  public abstract run(): any;
}

export function createTestResult(
  name: string,
  expected: string,
  actual: string,
  status: TestStatus,
  request: HttpRequest | null = null,
  response: HttpResponse | null = null,
  responseTime = 0,
  value: any = undefined,
): TestResult {
  return { name, expected, actual, status, value, request, response, responseTime };
}

export function createErrorTestResult(
  name: string,
  expected: string,
  actual: string,
  request: HttpRequest | null = null,
  value: any = undefined,
): TestResult {
  return createTestResult(
    name,
    expected,
    `Unexpected Error: ${String(actual)}`,
    TestStatus.Bug,
    request,
    null,
    0,
    value,
  );
}

export function determineTestStatus(
  response: HttpResponse,
  determine: (response: HttpResponse, statusCode: number) => { actual: string; status: TestStatus },
  allowedStatusCodes: number[] = [],
): {
  actual: string;
  status: TestStatus;
} {
  const statusCode = extractStatusCode(response);
  if (statusCode >= RESPONSE_STATUS.SERVER_ERROR && !allowedStatusCodes.includes(statusCode))
    return { actual: response.status, status: TestStatus.Bug };

  return determine(response, statusCode);
}
