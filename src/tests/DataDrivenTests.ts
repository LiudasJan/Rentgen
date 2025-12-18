import { datasets } from '../constants/datasets';
import { getResponseStatusTitle, RESPONSE_STATUS } from '../constants/responseStatus';
import { Abortable, Test } from '../decorators';
import {
  DataType,
  DynamicValue,
  HttpRequest,
  HttpResponse,
  Interval,
  TestData,
  TestOptions,
  TestResult,
  TestStatus,
} from '../types';
import {
  createHttpRequest,
  createTestHttpRequest,
  executeTimedRequest,
  extractBodyParameters,
  generateRandomNumber,
  generateRandomString,
  getBodyParameterValue,
  normalizeDecimal,
  parseBody,
  parseHeaders,
} from '../utils';
import {
  BaseTests,
  CLIENT_ERROR_RESPONSE_EXPECTED,
  createErrorTestResult,
  createTestResult,
  determineTestStatus,
  ORIGINAL_REQUEST_TEST_PARAMETER_NAME,
  SUCCESS_RESPONSE_EXPECTED,
} from './BaseTests';

const VALUE_NORMALIZATION_TEST_EXPECTED = `${RESPONSE_STATUS.BAD_REQUEST} ${getResponseStatusTitle(RESPONSE_STATUS.BAD_REQUEST)}/${RESPONSE_STATUS.UNPROCESSABLE_ENTITY} ${getResponseStatusTitle(RESPONSE_STATUS.UNPROCESSABLE_ENTITY)} or Trimmed/Normalized Value`;

export class DataDrivenTests extends BaseTests {
  public async run(): Promise<TestResult[]> {
    const { body, headers, messageType, method, protoFile, url } = this.options;
    const results: TestResult[] = [];
    const parsedHeaders = parseHeaders(headers);
    const parsedBody = parseBody(body, parsedHeaders, messageType, protoFile);
    const request = createHttpRequest(parsedBody, parsedHeaders, method, url);

    // Test original request first as baseline
    results.push(await this.testOriginalRequest(request));

    await runDataDrivenTests(
      this.options,
      async (parameterName: string, { type }: DynamicValue) => {
        const testData: TestData = {
          value: `   ${getBodyParameterValue(parsedBody, parameterName, parsedHeaders)}   `,
          valid: false,
        };
        results.push(
          await testRequestParameter(
            { ...this.options, parameterName, parameterType: 'body', testData },
            type === 'enum' ? CLIENT_ERROR_RESPONSE_EXPECTED : VALUE_NORMALIZATION_TEST_EXPECTED,
            type === 'enum' ? determineRequestParameterTestStatus : determineValueNormalizationTestStatus,
            this.onTestStart,
          ),
        );
      },
      async (parameterName: string, parameterValue: DynamicValue) => {
        results.push(
          ...((await this.testRequestParameterWithDataset(
            { ...this.options, parameterName, parameterType: 'body' },
            parameterValue,
          )) ?? []),
        );
      },
      async (parameterName: string, parameterValue: DynamicValue) => {
        results.push(
          ...((await this.testRequestParameterWithDataset(
            { ...this.options, parameterName, parameterType: 'query' },
            parameterValue,
          )) ?? []),
        );
      },
    );

    return results;
  }

  @Abortable
  @Test('Validates the original request succeeds as a baseline')
  private async testOriginalRequest(request: HttpRequest): Promise<TestResult> {
    this.onTestStart?.();

    return executeTimedRequest(
      request,
      (response, responseTime) => {
        const { actual, status } = determineTestStatus(response, (response, statusCode) => {
          const testStatus = { actual: response.status, status: TestStatus.Fail };
          if (statusCode >= RESPONSE_STATUS.OK && statusCode < RESPONSE_STATUS.REDIRECT)
            testStatus.status = TestStatus.Pass;

          return testStatus;
        });

        return createTestResult(
          ORIGINAL_REQUEST_TEST_PARAMETER_NAME,
          SUCCESS_RESPONSE_EXPECTED,
          actual,
          status,
          request,
          response,
          responseTime,
          request.body,
        );
      },
      (error) =>
        createErrorTestResult(
          ORIGINAL_REQUEST_TEST_PARAMETER_NAME,
          SUCCESS_RESPONSE_EXPECTED,
          String(error),
          request,
          request.body,
        ),
    );
  }

  @Abortable
  private async testRequestParameterWithDataset(
    options: TestOptions,
    parameterValue: DynamicValue,
  ): Promise<TestResult[]> {
    const { type, value } = parameterValue;
    const results: TestResult[] = [];
    const dataset = [
      ...generateDynamicTestData(parameterValue),
      ...(datasets[type] || []).map((dataset) => {
        if (type !== 'string' || !dataset.valid) return dataset;

        return {
          ...dataset,
          value: (dataset.value as string).substring(0, value as number),
        };
      }),
    ];

    for (const data of dataset)
      results.push(
        await testRequestParameter(
          { ...options, testData: data },
          data.valid ? SUCCESS_RESPONSE_EXPECTED : CLIENT_ERROR_RESPONSE_EXPECTED,
          determineRequestParameterTestStatus,
          this.onTestStart,
        ),
      );

    return results;
  }
}

export async function runDataDrivenTests(
  options: TestOptions,
  onValueNormalizationTest: (key: string, value: DynamicValue) => Promise<void>,
  onBodyParameterTest: (key: string, value: DynamicValue) => Promise<void>,
  onQueryParameterTest: (key: string, value: DynamicValue) => Promise<void>,
) {
  const { body, headers, messageType, protoFile, bodyParameters, queryParameters } = options;
  const parsedHeaders = parseHeaders(headers);
  const parsedBody = parseBody(body, parsedHeaders, messageType, protoFile);
  const originalBodyParameters = extractBodyParameters(parsedBody, parsedHeaders);

  // Test string value normalization (trimming)
  for (const [key, value] of Object.entries(bodyParameters)) {
    const originalBodyParameter = originalBodyParameters[key];
    if (isParameterTestSkipped(value.type) || isNormalizationTestSkipped(originalBodyParameter.type)) continue;
    await onValueNormalizationTest(key, value);
  }

  // Test body parameters
  for (const [key, value] of Object.entries(bodyParameters)) {
    if (isParameterTestSkipped(value.type)) continue;
    await onBodyParameterTest(key, value);
  }

  // Test query parameters
  for (const [key, value] of Object.entries(queryParameters)) {
    if (isParameterTestSkipped(value.type)) continue;
    await onQueryParameterTest(key, value);
  }
}

async function testRequestParameter(
  options: TestOptions,
  expected: string,
  determine: (response: HttpResponse, statusCode: number, testData: TestData) => { actual: string; status: TestStatus },
  onTestStart?: () => void,
): Promise<TestResult> {
  onTestStart?.();

  const { parameterName, parameterType, testData } = options;
  const request = createTestHttpRequest(options);

  return executeTimedRequest(
    request,
    (response, responseTime) => {
      const { actual, status } = determineTestStatus(response, (response, statusCode) =>
        determine(response, statusCode, testData),
      );

      return createTestResult(
        `${parameterType}.${parameterName}`,
        expected,
        actual,
        status,
        request,
        response,
        responseTime,
        testData.value,
      );
    },
    (error) =>
      createErrorTestResult(`${parameterType}.${parameterName}`, expected, String(error), request, testData.value),
  );
}

function determineValueNormalizationTestStatus(
  response: HttpResponse,
  statusCode: number,
  testData: TestData,
): { actual: string; status: TestStatus } {
  if (statusCode === RESPONSE_STATUS.BAD_REQUEST || statusCode === RESPONSE_STATUS.UNPROCESSABLE_ENTITY)
    return { actual: response.status, status: TestStatus.Pass };

  const responseBody = typeof response.body === 'string' ? response.body : JSON.stringify(response.body);
  if (!responseBody || !responseBody.includes(String(testData.value).trim()))
    return {
      actual: `${response.status} → Check Manually via GET Method or Database`,
      status: TestStatus.Info,
    };

  if (!responseBody.includes(String(testData.value)))
    return { actual: `${response.status} + Trimmed/Normalized Value`, status: TestStatus.Pass };

  return { actual: `${response.status} + Not Trimmed/Normalized Value`, status: TestStatus.Fail };
}

function determineRequestParameterTestStatus(
  response: HttpResponse,
  statusCode: number,
  testData: TestData,
): { actual: string; status: TestStatus } {
  const testStatus = { actual: response.status, status: TestStatus.Fail };
  if (
    (testData.valid && statusCode >= RESPONSE_STATUS.OK && statusCode < RESPONSE_STATUS.REDIRECT) ||
    (!testData.valid && statusCode >= RESPONSE_STATUS.BAD_REQUEST && statusCode < RESPONSE_STATUS.SERVER_ERROR)
  )
    testStatus.status = TestStatus.Pass;

  return testStatus;
}

export function generateDynamicTestData({ mandatory, type, value }: DynamicValue): TestData[] {
  const results: TestData[] = [];
  if (mandatory !== undefined) {
    results.push({ value: null, valid: !mandatory });

    if (!isNormalizationTestSkipped(type)) ['', '   '].forEach((value) => results.push({ value, valid: !mandatory }));
  }

  switch (type) {
    case 'enum':
      results.push(...generateEnumTestData(value as string));
      break;
    case 'number':
      results.push(...generateNumberBoundaryTestData(value as Interval));
      break;
    case 'string':
      results.push({ value: generateRandomString((value as number) + 1), valid: false });
      break;
    default:
  }

  return results;
}

export function generateEnumTestData(value: string): TestData[] {
  if (!value) return [];

  return value
    .split(',')
    .map((value) => value.trim())
    .flatMap((value) => [
      { value: value.trim(), valid: true },
      { value: value[0] + ' ' + value.slice(1), valid: false },
      {
        value:
          value[0].toLowerCase() === value[0]
            ? value[0].toUpperCase() + value.slice(1)
            : value[0].toLowerCase() + value.slice(1),
        valid: false,
      },
    ]);
}

export function generateNumberBoundaryTestData({ min, max }: Interval): TestData[] {
  const dataset: TestData[] = [];
  const delta = Number.isInteger(min) && Number.isInteger(max) ? 1 : 0.01;
  const normalizedMin = normalizeDecimal(min);
  const normalizedMax = normalizeDecimal(max);
  const range = normalizedMax - normalizedMin;

  dataset.push({ value: normalizedMin, valid: true });

  if (range > 0) {
    if (range > delta) dataset.push({ value: normalizeDecimal(normalizedMin + delta), valid: true });

    if (range > 3 * delta)
      dataset.push({
        value: generateRandomNumber(
          normalizeDecimal(normalizedMin + 2 * delta),
          normalizeDecimal(normalizedMax - 2 * delta),
        ),
        valid: true,
      });

    if (range > 4 * delta)
      dataset.push({
        value: generateRandomNumber(
          normalizeDecimal(normalizedMin + 2 * delta),
          normalizeDecimal(normalizedMax - 2 * delta),
        ),
        valid: true,
      });

    if (range >= 3 * delta) dataset.push({ value: normalizeDecimal(normalizedMax - delta), valid: true });

    dataset.push({ value: normalizedMax, valid: true });
  }

  dataset.push({ value: normalizeDecimal(normalizedMin - delta), valid: false });
  dataset.push({ value: normalizeDecimal(normalizedMax + delta), valid: false });

  return dataset;
}

export function isParameterTestSkipped(dataType: DataType): boolean {
  return (
    dataType === 'do-not-test' || dataType === 'random32' || dataType === 'randomInt' || dataType === 'randomEmail'
  );
}

export function isNormalizationTestSkipped(dataType: string | undefined): boolean {
  return dataType === 'boolean' || dataType === 'number';
}
