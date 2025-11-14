import { datasets } from '../constants/datasets';
import { HttpRequest, TestResult, TestStatus } from '../types';
import {
  convertFormEntriesToUrlEncoded,
  decodeMessage,
  encodeMessage,
  extractStatusCode,
  generateRandomEmail,
  generateRandomInteger,
  generateRandomString,
  getHeaderValue,
  parseFormData,
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
  fieldMappings: Record<string, string>,
  queryMappings: Record<string, string>,
  messageType: string,
  protoFile: File | null,
  setCurrentTest?: (value: number) => void,
  setTestCount?: (count: number) => void,
): Promise<TestResult[]> {
  const { body, headers, url } = request;
  const contentType = getHeaderValue(headers, 'content-type');
  const isForm = /application\/x-www-form-urlencoded/i.test(contentType);
  const formEntries = isForm ? parseFormData(String(body)) : [];

  // Calculate total number of tests (BODY + QUERY parameters)
  let testCount = 0;

  for (const [fieldName, dataType] of Object.entries(fieldMappings)) {
    if (dataType === 'do-not-test' || dataType === 'random32') continue;
    if (!isForm && !fieldName.startsWith('form.')) testCount += (datasets[dataType] || []).length;
    if (isForm && fieldName.startsWith('form.')) testCount += (datasets[dataType] || []).length;
  }

  for (const [, dataType] of Object.entries(queryMappings)) {
    if (dataType === 'do-not-test' || dataType === 'random32') continue;
    testCount += (datasets[dataType] || []).length;
  }

  setTestCount?.(1 + testCount);

  const results: TestResult[] = [];

  // Always send the original request first as baseline test
  try {
    const requestStartTime = performance.now();
    const response = await window.electronAPI.sendHttp(request);
    const responseTime = performance.now() - requestStartTime;

    results.push({
      actual: response.status,
      expected: EXPECTED_SUCCESS_RESPONSE,
      field: ORIGINAL_REQUEST_TEST_FIELD_NAME,
      request,
      response,
      responseTime,
      status: response.status?.startsWith('2') ? TestStatus.Pass : TestStatus.Fail,
      value: isForm ? Object.fromEntries(formEntries) : body,
    });
  } catch (error) {
    results.push({
      actual: `Unexpected error: ${String(error)}`,
      expected: EXPECTED_SUCCESS_RESPONSE,
      field: ORIGINAL_REQUEST_TEST_FIELD_NAME,
      request,
      response: null,
      responseTime: 0,
      status: TestStatus.Bug,
      value: isForm ? Object.fromEntries(formEntries) : body,
    });
  }

  let currentTestCounter = 0;
  for (const [fieldName, dataType] of Object.entries(fieldMappings)) {
    if (dataType === 'do-not-test') continue;

    const testDataset =
      dataType === 'random32' || dataType === 'randomInt' ? [{ dynamic: true, valid: true }] : datasets[dataType] || [];

    if (isForm) {
      if (!fieldName.startsWith('form.')) continue;

      const fieldKey = fieldName.slice('form.'.length);
      for (const testData of testDataset) {
        currentTestCounter++;
        setCurrentTest?.(currentTestCounter);

        const testValue = (testData as any).value;
        const modifiedFormEntries = [...formEntries];
        const generatedTestValue =
          dataType === 'randomInt'
            ? String(generateRandomInteger())
            : dataType === 'random32'
              ? generateRandomString()
              : dataType === 'randomEmail'
                ? generateRandomEmail()
                : String(testValue);

        // Update the target form field with test value
        let replaced = false;
        for (let i = 0; i < modifiedFormEntries.length; i++)
          if (modifiedFormEntries[i][0] === fieldKey) {
            modifiedFormEntries[i] = [fieldKey, generatedTestValue];
            replaced = true;
            break;
          }
        if (!replaced) modifiedFormEntries.push([fieldKey, generatedTestValue]);

        // Apply per-request randomization for other form fields
        for (const [mappedFieldName, mappedFieldType] of Object.entries(fieldMappings)) {
          if (!mappedFieldName.startsWith('form.')) continue;

          const mappedFieldKey = mappedFieldName.slice('form.'.length);
          if (mappedFieldKey === fieldKey) continue;

          let randomizedValue: string | null = null;
          if (mappedFieldType === 'random32') randomizedValue = generateRandomString();
          if (mappedFieldType === 'randomInt') randomizedValue = String(generateRandomInteger());
          if (mappedFieldType === 'randomEmail') randomizedValue = generateRandomEmail();

          if (randomizedValue !== null) {
            let updated = false;
            for (let i = 0; i < modifiedFormEntries.length; i++)
              if (modifiedFormEntries[i][0] === mappedFieldKey) {
                modifiedFormEntries[i] = [mappedFieldKey, randomizedValue];
                updated = true;
                break;
              }

            if (!updated) modifiedFormEntries.push([mappedFieldKey, randomizedValue]);
          }
        }

        const data = convertFormEntriesToUrlEncoded(modifiedFormEntries);
        const modifiedRequest: HttpRequest = { ...request, body: data };

        try {
          const requestStartTime = performance.now();
          const response = await window.electronAPI.sendHttp(modifiedRequest);
          const responseTime = performance.now() - requestStartTime;
          const statusCode = extractStatusCode(response);
          const isSuccessfulResponse = statusCode >= SUCCESS_STATUS_MIN && statusCode <= SUCCESS_STATUS_MAX;
          const testStatus =
            (testData.valid && isSuccessfulResponse) ||
            (!testData.valid && statusCode >= CLIENT_ERROR_STATUS_MIN && statusCode <= CLIENT_ERROR_STATUS_MAX)
              ? TestStatus.Pass
              : statusCode >= SERVER_ERROR_STATUS_MIN
                ? TestStatus.Bug
                : TestStatus.Fail;

          results.push({
            actual: response.status,
            expected: testData.valid ? EXPECTED_SUCCESS_RESPONSE : EXPECTED_CLIENT_ERROR_RESPONSE,
            field: fieldName,
            request: modifiedRequest,
            response,
            responseTime,
            status: testStatus,
            value: testValue,
          });
        } catch (error) {
          results.push({
            actual: 'Error',
            expected: testData.valid ? EXPECTED_SUCCESS_RESPONSE : EXPECTED_CLIENT_ERROR_RESPONSE,
            field: fieldName,
            request: modifiedRequest,
            response: String(error),
            responseTime: 0,
            status: TestStatus.Bug,
            value: testValue,
          });
        }
      }
    } else {
      for (const testData of testDataset) {
        currentTestCounter++;
        setCurrentTest?.(currentTestCounter);

        // Extract test value from dataset
        const testValue = (testData as any).value;

        // Create deep copy of original body to avoid mutation
        const modifiedBody = JSON.parse(JSON.stringify(body));
        const generatedTestValue =
          dataType === 'randomInt'
            ? generateRandomInteger()
            : dataType === 'random32'
              ? generateRandomString()
              : dataType === 'randomEmail'
                ? generateRandomEmail()
                : testValue;

        setDeepObjectProperty(modifiedBody, fieldName, generatedTestValue);

        // For each request, regenerate all random values to ensure fresh data
        for (const [fieldKey, fieldType] of Object.entries(fieldMappings)) {
          if (fieldType === 'random32') modifiedBody[fieldKey] = generateRandomString();
          if (fieldType === 'randomInt') modifiedBody[fieldKey] = generateRandomInteger();
          if (fieldType === 'randomEmail') modifiedBody[fieldKey] = generateRandomEmail();
        }

        let data: any = modifiedBody;
        if (protoFile && messageType) {
          try {
            data = encodeMessage(messageType, modifiedBody);
          } catch (error) {
            results.push({
              actual: 'Encode error',
              expected: testData.valid ? EXPECTED_SUCCESS_RESPONSE : EXPECTED_CLIENT_ERROR_RESPONSE,
              field: fieldName,
              request: { ...request, body: modifiedBody },
              response: String(error),
              responseTime: 0,
              status: TestStatus.Bug,
              value: testValue,
            });
            continue;
          }
        }

        const modifiedRequest: HttpRequest = { ...request, body: data };

        try {
          const requestStartTime = performance.now();
          const response = await window.electronAPI.sendHttp(modifiedRequest);
          const responseTime = performance.now() - requestStartTime;

          let decodedResponse: string | null = null;
          if (protoFile && messageType) {
            try {
              const decodedObject = decodeMessage(messageType, new Uint8Array(response.body));
              decodedResponse = JSON.stringify(decodedObject, null, 2);
            } catch {
              decodedResponse = null;
            }
          }

          // Parse HTTP status code from response
          const statusCode = extractStatusCode(response);
          const isSuccessfulResponse = statusCode >= SUCCESS_STATUS_MIN && statusCode <= SUCCESS_STATUS_MAX;
          const testStatus =
            (testData.valid && isSuccessfulResponse) ||
            (!testData.valid && statusCode >= CLIENT_ERROR_STATUS_MIN && statusCode <= CLIENT_ERROR_STATUS_MAX)
              ? TestStatus.Pass
              : statusCode >= SERVER_ERROR_STATUS_MIN
                ? TestStatus.Bug
                : TestStatus.Fail;

          results.push({
            actual: response.status,
            expected: testData.valid ? EXPECTED_SUCCESS_RESPONSE : EXPECTED_CLIENT_ERROR_RESPONSE,
            decoded: decodedResponse,
            field: fieldName,
            request: modifiedRequest,
            response,
            responseTime,
            status: testStatus,
            value: testValue,
          });
        } catch (error) {
          results.push({
            actual: 'Error',
            expected: testData.valid ? EXPECTED_SUCCESS_RESPONSE : EXPECTED_CLIENT_ERROR_RESPONSE,
            field: fieldName,
            request: modifiedRequest,
            response: String(error),
            responseTime: 0,
            status: TestStatus.Bug,
            value: testValue,
          });
        }
      }
    }
  }

  // Test query parameters with various data types
  for (const [queryParam, dataType] of Object.entries(queryMappings)) {
    if (dataType === 'do-not-test') continue;

    const testDataset = datasets[dataType] || [];

    for (const testData of testDataset) {
      currentTestCounter++;
      setCurrentTest?.(currentTestCounter);

      const testValue = testData.value;
      const urlWithQueryParam = new URL(url);
      urlWithQueryParam.searchParams.set(queryParam, String(testValue));

      const modifiedRequest: HttpRequest = { ...request, url: urlWithQueryParam.toString() };
      const requestStartTime = performance.now();
      const response = await window.electronAPI.sendHttp(modifiedRequest);
      const responseTime = performance.now() - requestStartTime;
      const statusCode = extractStatusCode(response);
      const isSuccessfulResponse = statusCode >= SUCCESS_STATUS_MIN && statusCode <= SUCCESS_STATUS_MAX;
      const testStatus =
        (testData.valid && isSuccessfulResponse) ||
        (!testData.valid && statusCode >= CLIENT_ERROR_STATUS_MIN && statusCode <= CLIENT_ERROR_STATUS_MAX)
          ? TestStatus.Pass
          : TestStatus.Fail;

      results.push({
        actual: response.status,
        expected: testData.valid ? EXPECTED_SUCCESS_RESPONSE : EXPECTED_CLIENT_ERROR_RESPONSE,
        field: `query.${queryParam}`,
        request: modifiedRequest,
        response,
        responseTime,
        status: testStatus,
        value: testValue,
      });
    }
  }

  return results;
}
