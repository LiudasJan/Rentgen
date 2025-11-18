import { BaseTests } from '.';
import { datasets } from '../constants/datasets';
import { RESPONSE_STATUS } from '../constants/responseStatus';
import { Test } from '../decorators';
import { FieldType, HttpRequest, HttpResponse, TestData, TestOptions, TestResult, TestStatus } from '../types';
import {
  convertUrlEncodedToFormEntries,
  createHttpRequest,
  createTestHttpRequest,
  executeTimedRequest,
  extractBodyFieldMappings,
  getFieldValueFromBody,
  isUrlEncodedContentType,
  parseBody,
  parseHeaders,
} from '../utils';

const VALUE_NORMALIZATION_TEST_EXPECTED = `Value must be trimmed/normalized or reject with ${RESPONSE_STATUS.CLIENT_ERROR}/${RESPONSE_STATUS.UNPROCESSABLE_ENTITY}`;
const SUCCESS_RESPONSE_EXPECTED = '2xx';
const CLIENT_ERROR_RESPONSE_EXPECTED = '4xx';
const ORIGINAL_REQUEST_TEST_FIELD_NAME = '[original request]';

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
      async (fieldName: string) => {
        const testData: TestData = {
          value: `   ${getFieldValueFromBody(parsedBody, fieldName, parsedHeaders)}   `,
          valid: false,
        };
        results.push(await this.testValueNormalization({ ...this.options, fieldName, mappingType: 'body', testData }));
      },
      async (fieldName: string, type: FieldType) => {
        const testDataset = datasets[type] || [];
        for (const testData of testDataset)
          results.push(await this.testMappings({ ...this.options, fieldName, mappingType: 'body', testData }));
      },
      async (fieldName: string, type: FieldType) => {
        const testDataset = datasets[type] || [];
        for (const testData of testDataset)
          results.push(await this.testMappings({ ...this.options, fieldName, mappingType: 'query', testData }));
      },
    );

    return results;
  }

  @Test('Tests the original request to establish a baseline for comparison')
  private async testOriginalRequest(request: HttpRequest): Promise<TestResult> {
    this.onTestStart?.();

    const { body, headers } = request;
    const formEntries = isUrlEncodedContentType(headers) ? convertUrlEncodedToFormEntries(body as string) : [];
    const bodyValue = formEntries.length > 0 ? Object.fromEntries(formEntries) : request.body;

    return executeTimedRequest(
      request,
      (response, responseTime, statusCode) =>
        createDataDrivenTestResult(
          ORIGINAL_REQUEST_TEST_FIELD_NAME,
          SUCCESS_RESPONSE_EXPECTED,
          response.status,
          statusCode >= RESPONSE_STATUS.OK && statusCode < RESPONSE_STATUS.REDIRECT ? TestStatus.Pass : TestStatus.Fail,
          bodyValue,
          request,
          response,
          responseTime,
        ),
      (error) =>
        createDataDrivenTestResult(
          ORIGINAL_REQUEST_TEST_FIELD_NAME,
          SUCCESS_RESPONSE_EXPECTED,
          `Unexpected error: ${String(error)}`,
          TestStatus.Bug,
          bodyValue,
          request,
        ),
    );
  }

  @Test('Tests value normalization (trimming) for string fields')
  private async testValueNormalization(options: TestOptions): Promise<TestResult> {
    this.onTestStart?.();

    const { fieldName, mappingType, testData } = options;
    const request = createTestHttpRequest(options);

    return executeTimedRequest(
      request,
      (response, responseTime, statusCode) => {
        const testStatus = determineValueNormalizationTestStatus(response, statusCode, testData);

        return createDataDrivenTestResult(
          `${mappingType}.${fieldName}`,
          VALUE_NORMALIZATION_TEST_EXPECTED,
          testStatus === TestStatus.Pass
            ? statusCode === RESPONSE_STATUS.CLIENT_ERROR || statusCode === RESPONSE_STATUS.UNPROCESSABLE_ENTITY
              ? `Rejected with ${statusCode}`
              : 'Value trimmed/normalized'
            : testStatus === TestStatus.Info
              ? 'Check manually via GET method or database'
              : 'Contains value with spaces, not trimmed/normalized',
          testStatus,
          testData.value,
          request,
          response,
          responseTime,
        );
      },
      (error) =>
        createDataDrivenTestResult(
          `${mappingType}.${fieldName}`,
          VALUE_NORMALIZATION_TEST_EXPECTED,
          `Unexpected error: ${String(error)}`,
          TestStatus.Bug,
          testData.value,
          request,
        ),
    );
  }

  @Test('Tests field mappings with various valid and invalid values')
  private async testMappings(options: TestOptions): Promise<TestResult> {
    this.onTestStart?.();

    const { fieldName, mappingType, testData } = options;
    const request = createTestHttpRequest(options);

    return executeTimedRequest(
      request,
      (response, responseTime, statusCode) => {
        const testStatus = determineMappingsTestStatus(statusCode, testData);

        return createDataDrivenTestResult(
          `${mappingType}.${fieldName}`,
          testData.valid ? SUCCESS_RESPONSE_EXPECTED : CLIENT_ERROR_RESPONSE_EXPECTED,
          response.status,
          testStatus,
          testData.value,
          request,
          response,
          responseTime,
        );
      },
      (error) =>
        createDataDrivenTestResult(
          `${mappingType}.${fieldName}`,
          testData.valid ? SUCCESS_RESPONSE_EXPECTED : CLIENT_ERROR_RESPONSE_EXPECTED,
          `Unexpected error: ${String(error)}`,
          TestStatus.Bug,
          testData.value,
          request,
        ),
    );
  }
}

export async function runDataDrivenTests(
  options: TestOptions,
  onValueNormalizationTest: (fieldName: string, type: FieldType) => Promise<void>,
  onBodyMappingTest: (fieldName: string, type: FieldType) => Promise<void>,
  onQueryMappingTest: (fieldName: string, type: FieldType) => Promise<void>,
) {
  const { body, headers, messageType, protoFile, bodyMappings, queryMappings } = options;
  const parsedHeaders = parseHeaders(headers);
  const parsedBody = parseBody(body, parsedHeaders, messageType, protoFile);
  const originalBodyMappings = extractBodyFieldMappings(parsedBody, parsedHeaders);

  // Test string value normalization (trimming)
  for (const [key, type] of Object.entries(bodyMappings)) {
    const originalType = originalBodyMappings[key];
    if (shouldSkipFieldType(type) || shouldSkipNormalizationTest(originalType)) continue;
    await onValueNormalizationTest(key, type);
  }

  // Test body fields
  for (const [key, type] of Object.entries(bodyMappings)) {
    if (shouldSkipFieldType(type)) continue;
    await onBodyMappingTest(key, type);
  }

  // Test query parameters
  for (const [key, type] of Object.entries(queryMappings)) {
    if (shouldSkipFieldType(type)) continue;
    await onQueryMappingTest(key, type);
  }
}

function createDataDrivenTestResult(
  name: string,
  expected: string,
  actual: string,
  status: TestStatus,
  value: any,
  request: HttpRequest,
  response: HttpResponse = null,
  responseTime = 0,
): TestResult {
  return { name, expected, actual, status, value, request, response, responseTime };
}

function determineValueNormalizationTestStatus(
  response: HttpResponse,
  statusCode: number,
  testData: TestData,
): TestStatus {
  if (statusCode >= RESPONSE_STATUS.SERVER_ERROR) return TestStatus.Bug;
  if (statusCode === RESPONSE_STATUS.CLIENT_ERROR || statusCode === RESPONSE_STATUS.UNPROCESSABLE_ENTITY)
    return TestStatus.Pass;

  const responseBody = typeof response.body === 'string' ? response.body : JSON.stringify(response.body);
  if (!responseBody) return TestStatus.Info;

  return !responseBody.includes(String(testData.value)) ? TestStatus.Pass : TestStatus.Fail;
}

function determineMappingsTestStatus(statusCode: number, testData: TestData): TestStatus {
  if (
    (testData.valid && statusCode >= RESPONSE_STATUS.OK && statusCode < RESPONSE_STATUS.REDIRECT) ||
    (!testData.valid && statusCode >= RESPONSE_STATUS.CLIENT_ERROR && statusCode < RESPONSE_STATUS.SERVER_ERROR)
  )
    return TestStatus.Pass;

  return statusCode >= RESPONSE_STATUS.SERVER_ERROR ? TestStatus.Bug : TestStatus.Fail;
}

export function shouldSkipFieldType(fieldType: FieldType): boolean {
  return (
    fieldType === 'do-not-test' || fieldType === 'random32' || fieldType === 'randomInt' || fieldType === 'randomEmail'
  );
}

export function shouldSkipNormalizationTest(fieldType: string | undefined): boolean {
  return fieldType === 'boolean' || fieldType === 'number';
}
