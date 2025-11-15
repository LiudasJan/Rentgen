import { executeTimedRequest } from '../api';
import { datasets } from '../constants/datasets';
import { FieldType, HttpRequest, TestData, TestResult, TestStatus } from '../types';
import {
  convertFormEntriesToUrlEncoded,
  convertUrlEncodedToFormEntries,
  decodeProtobufResponse,
  encodeMessage,
  getHeaderValue,
  getRandomizedValueByFieldType,
  setDeepObjectProperty,
  updateFormEntry,
} from '../utils';

const SUCCESS_STATUS_MIN = 200;
const SUCCESS_STATUS_MAX = 299;
const CLIENT_ERROR_STATUS_MIN = 400;
const CLIENT_ERROR_STATUS_MAX = 499;
const SERVER_ERROR_STATUS_MIN = 500;
const EXPECTED_SUCCESS_RESPONSE = '2xx';
const EXPECTED_CLIENT_ERROR_RESPONSE = '4xx';
const ORIGINAL_REQUEST_TEST_FIELD_NAME = '[original request]';

export async function runDataDrivenTests(
  request: HttpRequest,
  fieldMappings: Record<string, FieldType>,
  queryMappings: Record<string, FieldType>,
  messageType: string,
  protoFile: File | null,
  onTestStart?: () => void,
): Promise<TestResult[]> {
  const { body, headers } = request;
  const contentType = getHeaderValue(headers, 'content-type');
  const formEntries = /application\/x-www-form-urlencoded/i.test(contentType)
    ? convertUrlEncodedToFormEntries(String(body))
    : [];
  const results: TestResult[] = [];

  // Test original request first as baseline
  results.push(await testOriginalRequest(request, formEntries, onTestStart));

  // Test body fields
  for (const [fieldName, fieldType] of Object.entries(fieldMappings)) {
    if (shouldSkipFieldType(fieldType)) continue;

    const testDataset = datasets[fieldType] || [];
    for (const testData of testDataset)
      results.push(
        await testBodyFields(
          fieldName,
          testData,
          request,
          formEntries,
          fieldMappings,
          messageType,
          protoFile,
          onTestStart,
        ),
      );
  }

  // Test query parameters
  for (const [queryParameter, fieldType] of Object.entries(queryMappings)) {
    if (shouldSkipFieldType(fieldType)) continue;

    const testDataset = datasets[fieldType] || [];
    for (const testData of testDataset)
      results.push(await testQueryParameters(queryParameter, testData, request, queryMappings, onTestStart));
  }

  return results;
}

async function testOriginalRequest(
  request: HttpRequest,
  formEntries: Array<[string, string]>,
  onTestStart?: () => void,
): Promise<TestResult> {
  onTestStart?.();

  const bodyValue = formEntries.length > 0 ? Object.fromEntries(formEntries) : request.body;
  return executeTimedRequest(
    request,
    (response, responseTime, statusCode) =>
      createDataDrivenTestResult(
        ORIGINAL_REQUEST_TEST_FIELD_NAME,
        EXPECTED_SUCCESS_RESPONSE,
        response.status,
        isSuccessStatus(statusCode) ? TestStatus.Pass : TestStatus.Fail,
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

async function testBodyFields(
  fieldName: string,
  testData: TestData,
  request: HttpRequest,
  formEntries: Array<[string, string]>,
  fieldMappings: Record<string, FieldType>,
  messageType: string,
  protoFile: File | null,
  onTestStart?: () => void,
): Promise<TestResult> {
  onTestStart?.();

  let data: Record<string, unknown> | string | Uint8Array | null = null;
  if (formEntries.length > 0) {
    const modifiedFormEntries = [...formEntries];

    // Update the field being tested
    updateFormEntry(modifiedFormEntries, fieldName, testData.value);

    // Apply random values to random field types
    for (const [fieldKey, fieldType] of Object.entries(fieldMappings)) {
      const randomizedValue = getRandomizedValueByFieldType(fieldType);
      if (randomizedValue !== null) updateFormEntry(modifiedFormEntries, fieldKey, randomizedValue);
    }

    data = convertFormEntriesToUrlEncoded(modifiedFormEntries);
  } else {
    const modifiedBody = structuredClone(request.body);

    // Update the field being tested
    setDeepObjectProperty(modifiedBody, fieldName, testData.value);

    // Apply random values to random field types
    for (const [fieldKey, fieldType] of Object.entries(fieldMappings)) {
      const randomizedValue = getRandomizedValueByFieldType(fieldType);
      if (randomizedValue !== null) setDeepObjectProperty(modifiedBody, fieldKey, randomizedValue);
    }

    data = structuredClone(modifiedBody);
    if (protoFile && messageType) {
      try {
        data = encodeMessage(messageType, data);
      } catch (error) {
        return createDataDrivenTestResult(
          fieldName,
          testData.valid ? EXPECTED_SUCCESS_RESPONSE : EXPECTED_CLIENT_ERROR_RESPONSE,
          'Encode error',
          TestStatus.Bug,
          testData.value,
          { ...request, body: data },
          String(error),
        );
      }
    }
  }

  const modifiedRequest: HttpRequest = { ...request, body: data };
  return executeTimedRequest(
    modifiedRequest,
    (response, responseTime, statusCode) => {
      const testStatus = determineTestStatus(testData, statusCode);
      const decoded =
        formEntries.length === 0 && protoFile && messageType ? decodeProtobufResponse(messageType, response) : null;

      return createDataDrivenTestResult(
        fieldName,
        testData.valid ? EXPECTED_SUCCESS_RESPONSE : EXPECTED_CLIENT_ERROR_RESPONSE,
        response.status,
        testStatus,
        testData.value,
        modifiedRequest,
        response,
        responseTime,
        decoded,
      );
    },
    (error) =>
      createDataDrivenTestResult(
        fieldName,
        testData.valid ? EXPECTED_SUCCESS_RESPONSE : EXPECTED_CLIENT_ERROR_RESPONSE,
        `Unexpected error: ${String(error)}`,
        TestStatus.Bug,
        testData.value,
        modifiedRequest,
        String(error),
      ),
  );
}

async function testQueryParameters(
  queryParameter: string,
  testData: TestData,
  request: HttpRequest,
  queryMappings: Record<string, FieldType>,
  onTestStart?: () => void,
): Promise<TestResult> {
  onTestStart?.();

  const urlWithQueryParam = new URL(request.url);
  urlWithQueryParam.searchParams.set(queryParameter, String(testData.value));

  // Apply random values to random query parameter types
  for (const [queryParameterKey, fieldType] of Object.entries(queryMappings)) {
    const randomizedValue = getRandomizedValueByFieldType(fieldType);
    if (randomizedValue !== null) urlWithQueryParam.searchParams.set(queryParameterKey, randomizedValue);
  }

  const modifiedRequest: HttpRequest = { ...request, url: urlWithQueryParam.toString() };
  return executeTimedRequest(
    modifiedRequest,
    (response, responseTime, statusCode) => {
      const testStatus = determineTestStatus(testData, statusCode);

      return createDataDrivenTestResult(
        `query.${queryParameter}`,
        testData.valid ? EXPECTED_SUCCESS_RESPONSE : EXPECTED_CLIENT_ERROR_RESPONSE,
        response.status,
        testStatus,
        testData.value,
        modifiedRequest,
        response,
        responseTime,
      );
    },
    (error) =>
      createDataDrivenTestResult(
        `query.${queryParameter}`,
        testData.valid ? EXPECTED_SUCCESS_RESPONSE : EXPECTED_CLIENT_ERROR_RESPONSE,
        `Unexpected error: ${String(error)}`,
        TestStatus.Bug,
        testData.value,
        modifiedRequest,
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
  decoded: string | null = null,
): TestResult {
  return { field, expected, actual, status, value, request, response, responseTime, decoded };
}

export function shouldSkipFieldType(fieldType: FieldType): boolean {
  return fieldType === 'do-not-test' || isRandomFieldType(fieldType);
}

export function isRandomFieldType(fieldType: FieldType): boolean {
  return fieldType === 'random32' || fieldType === 'randomInt' || fieldType === 'randomEmail';
}

function isSuccessStatus(statusCode: number): boolean {
  return statusCode >= SUCCESS_STATUS_MIN && statusCode <= SUCCESS_STATUS_MAX;
}

function isClientErrorStatus(statusCode: number): boolean {
  return statusCode >= CLIENT_ERROR_STATUS_MIN && statusCode <= CLIENT_ERROR_STATUS_MAX;
}

function isServerErrorStatus(statusCode: number): boolean {
  return statusCode >= SERVER_ERROR_STATUS_MIN;
}

function determineTestStatus(testData: TestData, statusCode: number): TestStatus {
  const isSuccess = isSuccessStatus(statusCode);
  const isClientError = isClientErrorStatus(statusCode);

  if ((testData.valid && isSuccess) || (!testData.valid && isClientError)) return TestStatus.Pass;

  return isServerErrorStatus(statusCode) ? TestStatus.Bug : TestStatus.Fail;
}
