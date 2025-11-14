import { datasets } from '../constants/datasets';
import { HttpRequest, TestData, TestResult, TestStatus } from '../types';
import {
  convertFormEntriesToUrlEncoded,
  convertUrlEncodedToFormEntries,
  decodeMessage,
  encodeMessage,
  extractStatusCode,
  FieldType,
  generateRandomEmail,
  generateRandomInteger,
  generateRandomString,
  getHeaderValue,
  setDeepObjectProperty,
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
  for (const [fieldName, dataType] of Object.entries(fieldMappings)) {
    if (dataType === 'do-not-test') continue;

    const testDataset = getTestDataset(dataType);
    for (const testData of testDataset)
      results.push(
        await testBodyFields(fieldName, testData, request, formEntries, messageType, protoFile, onTestStart),
      );
  }

  // Test query parameters
  for (const [queryParameter, dataType] of Object.entries(queryMappings)) {
    if (dataType === 'do-not-test') continue;

    const testDataset = getTestDataset(dataType);
    for (const testData of testDataset)
      results.push(await testQueryParameters(queryParameter, testData, request, onTestStart));
  }

  return results;
}

async function testOriginalRequest(
  request: HttpRequest,
  formEntries: Array<[string, string]>,
  onTestStart?: () => void,
): Promise<TestResult> {
  onTestStart?.();

  try {
    const requestStartTime = performance.now();
    const response = await window.electronAPI.sendHttp(request);
    const responseTime = performance.now() - requestStartTime;
    const statusCode = extractStatusCode(response);

    return createDataDrivenTestResult(
      ORIGINAL_REQUEST_TEST_FIELD_NAME,
      EXPECTED_SUCCESS_RESPONSE,
      response.status,
      isSuccessStatus(statusCode) ? TestStatus.Pass : TestStatus.Fail,
      formEntries.length > 0 ? Object.fromEntries(formEntries) : request.body,
      request,
      response,
      responseTime,
    );
  } catch (error) {
    return createDataDrivenTestResult(
      ORIGINAL_REQUEST_TEST_FIELD_NAME,
      EXPECTED_SUCCESS_RESPONSE,
      `Unexpected error: ${String(error)}`,
      TestStatus.Bug,
      formEntries.length > 0 ? Object.fromEntries(formEntries) : request.body,
      request,
      null,
      0,
    );
  }
}

async function testBodyFields(
  fieldName: string,
  testData: TestData,
  request: HttpRequest,
  formEntries: Array<[string, string]>,
  messageType: string,
  protoFile: File | null,
  onTestStart?: () => void,
): Promise<TestResult> {
  onTestStart?.();

  let data: Record<string, unknown> | string | Uint8Array | null = null;
  if (formEntries.length > 0) {
    const fieldKey = fieldName.slice('form.'.length);
    const modifiedFormEntries = [...formEntries];

    for (let i = 0; i < modifiedFormEntries.length; i++)
      if (modifiedFormEntries[i][0] === fieldKey) {
        modifiedFormEntries[i] = [fieldKey, testData.value];
        break;
      }

    data = convertFormEntriesToUrlEncoded(modifiedFormEntries);
  } else {
    const modifiedBody = JSON.parse(JSON.stringify(request.body));
    setDeepObjectProperty(modifiedBody, fieldName, testData.value);

    data = modifiedBody;
    if (protoFile && messageType) {
      try {
        data = encodeMessage(messageType, modifiedBody);
      } catch (error) {
        return createDataDrivenTestResult(
          fieldName,
          testData.valid ? EXPECTED_SUCCESS_RESPONSE : EXPECTED_CLIENT_ERROR_RESPONSE,
          'Encode error',
          TestStatus.Bug,
          testData.value,
          { ...request, body: modifiedBody },
          String(error),
        );
      }
    }
  }

  const modifiedRequest: HttpRequest = { ...request, body: data };

  try {
    const requestStartTime = performance.now();
    const response = await window.electronAPI.sendHttp(modifiedRequest);
    const responseTime = performance.now() - requestStartTime;
    const statusCode = extractStatusCode(response);
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
  } catch (error) {
    return createDataDrivenTestResult(
      fieldName,
      testData.valid ? EXPECTED_SUCCESS_RESPONSE : EXPECTED_CLIENT_ERROR_RESPONSE,
      'Error',
      TestStatus.Bug,
      testData.value,
      modifiedRequest,
      String(error),
    );
  }
}

async function testQueryParameters(
  queryParameter: string,
  testData: TestData,
  request: HttpRequest,
  onTestStart?: () => void,
): Promise<TestResult> {
  onTestStart?.();

  const urlWithQueryParam = new URL(request.url);
  urlWithQueryParam.searchParams.set(queryParameter, String(testData.value));

  const modifiedRequest: HttpRequest = { ...request, url: urlWithQueryParam.toString() };

  try {
    const requestStartTime = performance.now();
    const response = await window.electronAPI.sendHttp(modifiedRequest);
    const responseTime = performance.now() - requestStartTime;
    const statusCode = extractStatusCode(response);
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
  } catch (error) {
    return createDataDrivenTestResult(
      `query.${queryParameter}`,
      testData.valid ? EXPECTED_SUCCESS_RESPONSE : EXPECTED_CLIENT_ERROR_RESPONSE,
      'Error',
      TestStatus.Bug,
      testData.value,
      modifiedRequest,
      String(error),
    );
  }
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

function getTestDataset(dataType: FieldType): TestData[] {
  if (dataType === 'random32') return [{ value: generateRandomString(), valid: true }];
  if (dataType === 'randomInt') return [{ value: String(generateRandomInteger()), valid: true }];
  if (dataType === 'randomEmail') return [{ value: generateRandomEmail(), valid: true }];

  return datasets[dataType] || [];
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

function decodeProtobufResponse(messageType: string, response: any): string | null {
  try {
    return JSON.stringify(decodeMessage(messageType, new Uint8Array(response.body)), null, 2);
  } catch {
    return null;
  }
}
