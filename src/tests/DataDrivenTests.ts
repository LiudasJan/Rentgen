import { datasets } from '../constants/datasets';
import { getResponseStatusTitle, RESPONSE_STATUS } from '../constants/responseStatus';
import { Test } from '../decorators';
import { FieldType, HttpRequest, TestData, TestOptions, TestResult, TestStatus } from '../types';
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
import {
  BaseTests,
  CLIENT_ERROR_RESPONSE_EXPECTED,
  createErrorTestResult,
  createTestResult,
  determineTestStatus,
  SUCCESS_RESPONSE_EXPECTED,
} from './BaseTests';

const VALUE_NORMALIZATION_TEST_EXPECTED = `${RESPONSE_STATUS.BAD_REQUEST} ${getResponseStatusTitle(RESPONSE_STATUS.BAD_REQUEST)}/${RESPONSE_STATUS.UNPROCESSABLE_ENTITY} ${getResponseStatusTitle(RESPONSE_STATUS.UNPROCESSABLE_ENTITY)} or Trimmed/Normalized Value`;
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
        results.push(
          await testValueNormalization({ ...this.options, fieldName, mappingType: 'body', testData }, this.onTestStart),
        );
      },
      async (fieldName: string, type: FieldType) => {
        const testDataset = datasets[type] || [];
        for (const testData of testDataset)
          results.push(
            await testMappings({ ...this.options, fieldName, mappingType: 'body', testData }, this.onTestStart),
          );
      },
      async (fieldName: string, type: FieldType) => {
        const testDataset = datasets[type] || [];
        for (const testData of testDataset)
          results.push(
            await testMappings({ ...this.options, fieldName, mappingType: 'query', testData }, this.onTestStart),
          );
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
      (response, responseTime) => {
        const { actual, status } = determineTestStatus(response, (response, statusCode) => {
          const testStatus = { actual: response.status, status: TestStatus.Fail };
          if (statusCode >= RESPONSE_STATUS.OK && statusCode < RESPONSE_STATUS.REDIRECT)
            testStatus.status = TestStatus.Pass;

          return testStatus;
        });

        return createTestResult(
          ORIGINAL_REQUEST_TEST_FIELD_NAME,
          SUCCESS_RESPONSE_EXPECTED,
          actual,
          status,
          request,
          response,
          responseTime,
          bodyValue,
        );
      },
      (error) =>
        createErrorTestResult(
          ORIGINAL_REQUEST_TEST_FIELD_NAME,
          SUCCESS_RESPONSE_EXPECTED,
          String(error),
          request,
          bodyValue,
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

async function testValueNormalization(options: TestOptions, onTestStart?: () => void): Promise<TestResult> {
  onTestStart?.();

  const { fieldName, mappingType, testData } = options;
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
        `${mappingType}.${fieldName}`,
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
        `${mappingType}.${fieldName}`,
        VALUE_NORMALIZATION_TEST_EXPECTED,
        String(error),
        request,
        testData.value,
      ),
  );
}

async function testMappings(options: TestOptions, onTestStart?: () => void): Promise<TestResult> {
  onTestStart?.();

  const { fieldName, mappingType, testData } = options;
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
        `${mappingType}.${fieldName}`,
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
        `${mappingType}.${fieldName}`,
        testData.valid ? SUCCESS_RESPONSE_EXPECTED : CLIENT_ERROR_RESPONSE_EXPECTED,
        String(error),
        request,
        testData.value,
      ),
  );
}

export function shouldSkipFieldType(fieldType: FieldType): boolean {
  return (
    fieldType === 'do-not-test' || fieldType === 'random32' || fieldType === 'randomInt' || fieldType === 'randomEmail'
  );
}

export function shouldSkipNormalizationTest(fieldType: string | undefined): boolean {
  return fieldType === 'boolean' || fieldType === 'number';
}
