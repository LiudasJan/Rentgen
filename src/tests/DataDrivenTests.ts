import { datasets } from '../constants/datasets';
import { getResponseStatusTitle, RESPONSE_STATUS } from '../constants/responseStatus';
import { Test } from '../decorators';
import { DataType, DynamicValue, HttpRequest, TestData, TestOptions, TestResult, TestStatus } from '../types';
import {
  createHttpRequest,
  createTestHttpRequest,
  executeTimedRequest,
  extractBodyParameters,
  generateRandomNumber,
  getBodyParameterValue,
  parseBody,
  parseHeaders,
} from '../utils';
import {
  BaseTests,
  CLIENT_ERROR_RESPONSE_EXPECTED,
  createErrorTestResult,
  createTestResult,
  determineTestStatus,
  SUCCESS_RESPONSE_EXPECTED,
} from './BaseTests';

const VALUE_NORMALIZATION_TEST_EXPECTED = `${RESPONSE_STATUS.BAD_REQUEST} ${getResponseStatusTitle(RESPONSE_STATUS.BAD_REQUEST)}/${RESPONSE_STATUS.UNPROCESSABLE_ENTITY} ${getResponseStatusTitle(RESPONSE_STATUS.UNPROCESSABLE_ENTITY)} or Trimmed/Normalized Value`;
const ORIGINAL_REQUEST_TEST_PARAMETER_NAME = '[original request]';

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
      async (parameterName: string) => {
        const testData: TestData = {
          value: `   ${getBodyParameterValue(parsedBody, parameterName, parsedHeaders)}   `,
          valid: false,
        };
        results.push(
          await testValueNormalization(
            { ...this.options, parameterName, parameterType: 'body', testData },
            this.onTestStart,
          ),
        );
      },
      async (parameterName: string, parameterValue: DynamicValue) => {
        const testDataset = [...getDynamicDataset(parameterValue), ...(datasets[parameterValue.type] || [])];
        for (const testData of testDataset)
          results.push(
            await testRequestParameter(
              { ...this.options, parameterName, parameterType: 'body', testData },
              this.onTestStart,
            ),
          );
      },
      async (parameterName: string, parameterValue: DynamicValue) => {
        const testDataset = [...getDynamicDataset(parameterValue), ...(datasets[parameterValue.type] || [])];
        for (const testData of testDataset)
          results.push(
            await testRequestParameter(
              { ...this.options, parameterName, parameterType: 'query', testData },
              this.onTestStart,
            ),
          );
      },
    );

    return results;
  }

  @Test('Tests the original request to establish a baseline for comparison')
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
}

export async function runDataDrivenTests(
  options: TestOptions,
  onValueNormalizationTest: (key: string, type: DataType) => Promise<void>,
  onBodyParameterTest: (key: string, value: DynamicValue) => Promise<void>,
  onQueryParameterTest: (key: string, value: DynamicValue) => Promise<void>,
) {
  const { body, headers, messageType, protoFile, bodyParameters, queryParameters } = options;
  const parsedHeaders = parseHeaders(headers);
  const parsedBody = parseBody(body, parsedHeaders, messageType, protoFile);
  const originalBodyParameters = extractBodyParameters(parsedBody, parsedHeaders);

  // Test string value normalization (trimming)
  for (const [key, { type }] of Object.entries(bodyParameters)) {
    const originalBodyParameter = originalBodyParameters[key];
    if (shouldSkipParameterTest(type) || shouldSkipNormalizationTest(originalBodyParameter.type)) continue;
    await onValueNormalizationTest(key, type);
  }

  // Test body parameters
  for (const [key, value] of Object.entries(bodyParameters)) {
    if (shouldSkipParameterTest(value.type)) continue;
    await onBodyParameterTest(key, value);
  }

  // Test query parameters
  for (const [key, value] of Object.entries(queryParameters)) {
    if (shouldSkipParameterTest(value.type)) continue;
    await onQueryParameterTest(key, value);
  }
}

async function testValueNormalization(options: TestOptions, onTestStart?: () => void): Promise<TestResult> {
  onTestStart?.();

  const { parameterName, parameterType, testData } = options;
  const request = createTestHttpRequest(options);

  return executeTimedRequest(
    request,
    (response, responseTime) => {
      const { actual, status } = determineTestStatus(response, (response, statusCode) => {
        if (statusCode === RESPONSE_STATUS.BAD_REQUEST || statusCode === RESPONSE_STATUS.UNPROCESSABLE_ENTITY)
          return { actual: response.status, status: TestStatus.Pass };

        const responseBody = typeof response.body === 'string' ? response.body : JSON.stringify(response.body);
        if (!responseBody)
          return {
            actual: `${response.status} → Check Manually via GET Method or Database`,
            status: TestStatus.Info,
          };

        if (!responseBody.includes(String(testData.value)))
          return { actual: `${response.status} + Trimmed/Normalized Value`, status: TestStatus.Pass };

        return { actual: `${response.status} + Not Trimmed/Normalized Value`, status: TestStatus.Fail };
      });

      return createTestResult(
        `${parameterType}.${parameterName}`,
        VALUE_NORMALIZATION_TEST_EXPECTED,
        actual,
        status,
        request,
        response,
        responseTime,
        testData.value,
      );
    },
    (error) =>
      createErrorTestResult(
        `${parameterType}.${parameterName}`,
        VALUE_NORMALIZATION_TEST_EXPECTED,
        String(error),
        request,
        testData.value,
      ),
  );
}

async function testRequestParameter(options: TestOptions, onTestStart?: () => void): Promise<TestResult> {
  onTestStart?.();

  const { parameterName, parameterType, testData } = options;
  const request = createTestHttpRequest(options);

  return executeTimedRequest(
    request,
    (response, responseTime) => {
      const { actual, status } = determineTestStatus(response, (response, statusCode) => {
        const testStatus = { actual: response.status, status: TestStatus.Fail };
        if (
          (testData.valid && statusCode >= RESPONSE_STATUS.OK && statusCode < RESPONSE_STATUS.REDIRECT) ||
          (!testData.valid && statusCode >= RESPONSE_STATUS.BAD_REQUEST && statusCode < RESPONSE_STATUS.SERVER_ERROR)
        )
          testStatus.status = TestStatus.Pass;

        return testStatus;
      });

      return createTestResult(
        `${parameterType}.${parameterName}`,
        testData.valid ? SUCCESS_RESPONSE_EXPECTED : CLIENT_ERROR_RESPONSE_EXPECTED,
        actual,
        status,
        request,
        response,
        responseTime,
        testData.value,
      );
    },
    (error) =>
      createErrorTestResult(
        `${parameterType}.${parameterName}`,
        testData.valid ? SUCCESS_RESPONSE_EXPECTED : CLIENT_ERROR_RESPONSE_EXPECTED,
        String(error),
        request,
        testData.value,
      ),
  );
}

export function getDynamicDataset({ type, value }: DynamicValue): TestData[] {
  switch (type) {
    case 'number':
      return getNumberDynamicBoundaryDataset(value);
    default:
      return [];
  }
}

export function getNumberDynamicBoundaryDataset(value: { from: number; to: number }): TestData[] {
  const dataset: TestData[] = [];
  if (!value) return dataset;

  const delta = Number.isInteger(value.from) && Number.isInteger(value.to) ? 1 : 0.01;
  const range = value.to - value.from;

  if (range === 0) dataset.push({ value: value.from, valid: true });
  else {
    dataset.push({ value: value.from, valid: true });

    if (range > delta) dataset.push({ value: value.from + delta, valid: true });

    if (range > 3 * delta)
      dataset.push({ value: generateRandomNumber(value.from + 2 * delta, value.to - 2 * delta), valid: true });

    if (range > 4 * delta)
      dataset.push({ value: generateRandomNumber(value.from + 2 * delta, value.to - 2 * delta), valid: true });

    if (range >= 3 * delta) dataset.push({ value: value.to - delta, valid: true });

    dataset.push({ value: value.to, valid: true });
  }

  dataset.push({ value: value.from - delta, valid: false });
  dataset.push({ value: value.to + delta, valid: false });

  return dataset;
}

export function shouldSkipParameterTest(dataType: DataType): boolean {
  return (
    dataType === 'do-not-test' || dataType === 'random32' || dataType === 'randomInt' || dataType === 'randomEmail'
  );
}

export function shouldSkipNormalizationTest(dataType: string | undefined): boolean {
  return dataType === 'boolean' || dataType === 'number';
}
