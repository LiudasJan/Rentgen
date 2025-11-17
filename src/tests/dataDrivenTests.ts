import { datasets } from '../constants/datasets';
import { RESPONSE_STATUS } from '../constants/responseStatus';
import { FieldType, HttpRequest, TestData, TestOptions, TestResult, TestStatus } from '../types';
import {
  convertUrlEncodedToFormEntries,
  createHttpRequest,
  createTestHttpRequest,
  executeTimedRequest,
  isUrlEncodedContentType,
  parseBody,
  parseHeaders,
} from '../utils';

const EXPECTED_SUCCESS_RESPONSE = '2xx';
const EXPECTED_CLIENT_ERROR_RESPONSE = '4xx';
const ORIGINAL_REQUEST_TEST_FIELD_NAME = '[original request]';

export async function runDataDrivenTests(options: TestOptions, onTestStart?: () => void): Promise<TestResult[]> {
  const { body, bodyMappings, headers, messageType, method, protoFile, queryMappings, url } = options;
  const results: TestResult[] = [];
  const parsedHeaders = parseHeaders(headers);
  const parsedBody = parseBody(body, parsedHeaders, messageType, protoFile);
  const request = createHttpRequest(parsedBody, parsedHeaders, method, url);

  // Test original request first as baseline
  results.push(await testOriginalRequest(request, onTestStart));

  // Test body fields
  for (const [fieldName, type] of Object.entries(bodyMappings)) {
    if (shouldSkipFieldType(type)) continue;

    const testDataset = datasets[type] || [];
    for (const testData of testDataset)
      results.push(await testMappings({ ...options, fieldName, mappingType: 'body', testData }, onTestStart));
  }

  // Test query parameters
  for (const [fieldName, type] of Object.entries(queryMappings)) {
    if (shouldSkipFieldType(type)) continue;

    const testDataset = datasets[type] || [];
    for (const testData of testDataset)
      results.push(await testMappings({ ...options, fieldName, mappingType: 'query', testData }, onTestStart));
  }

  return results;
}

async function testOriginalRequest(request: HttpRequest, onTestStart?: () => void): Promise<TestResult> {
  onTestStart?.();

  const { body, headers } = request;
  const formEntries = isUrlEncodedContentType(headers) ? convertUrlEncodedToFormEntries(body as string) : [];
  const bodyValue = formEntries.length > 0 ? Object.fromEntries(formEntries) : request.body;

  return executeTimedRequest(
    request,
    (response, responseTime, statusCode) =>
      createDataDrivenTestResult(
        ORIGINAL_REQUEST_TEST_FIELD_NAME,
        EXPECTED_SUCCESS_RESPONSE,
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
        EXPECTED_SUCCESS_RESPONSE,
        `Unexpected error: ${String(error)}`,
        TestStatus.Bug,
        bodyValue,
        request,
        null,
        0,
      ),
  );
}

async function testMappings(options: TestOptions, onTestStart?: () => void): Promise<TestResult> {
  onTestStart?.();

  const { fieldName, mappingType, testData } = options;
  const request = createTestHttpRequest(options);

  return executeTimedRequest(
    request,
    (response, responseTime, statusCode) => {
      const testStatus = determineTestStatus(testData, statusCode);

      return createDataDrivenTestResult(
        `${mappingType}.${fieldName}`,
        testData.valid ? EXPECTED_SUCCESS_RESPONSE : EXPECTED_CLIENT_ERROR_RESPONSE,
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
        testData.valid ? EXPECTED_SUCCESS_RESPONSE : EXPECTED_CLIENT_ERROR_RESPONSE,
        `Unexpected error: ${String(error)}`,
        TestStatus.Bug,
        testData.value,
        request,
        String(error),
      ),
  );
}

function createDataDrivenTestResult(
  field: string,
  expected: string,
  actual: string,
  status: TestStatus,
  value: any,
  request: HttpRequest,
  response: any = null,
  responseTime = 0,
): TestResult {
  return { field, expected, actual, status, value, request, response, responseTime };
}

export function shouldSkipFieldType(fieldType: FieldType): boolean {
  return (
    fieldType === 'do-not-test' || fieldType === 'random32' || fieldType === 'randomInt' || fieldType === 'randomEmail'
  );
}

function determineTestStatus(testData: TestData, statusCode: number): TestStatus {
  if (
    (testData.valid && statusCode >= RESPONSE_STATUS.OK && statusCode < RESPONSE_STATUS.REDIRECT) ||
    (!testData.valid && statusCode >= RESPONSE_STATUS.CLIENT_ERROR && statusCode < RESPONSE_STATUS.SERVER_ERROR)
  )
    return TestStatus.Pass;

  return statusCode >= RESPONSE_STATUS.SERVER_ERROR ? TestStatus.Bug : TestStatus.Fail;
}
