import { Method } from 'axios';
import { datasets } from '../constants/datasets';
import { Test, TestStatus } from '../types';
import {
  decodeMessage,
  encodeMessage,
  generateRandomEmail,
  generateRandomInteger,
  generateRandomString,
  setDeepObjectProperty,
} from '../utils';

const SUCCESS_STATUS_MIN = 200;
const SUCCESS_STATUS_MAX = 299;
const CLIENT_ERROR_STATUS_MIN = 400;
const CLIENT_ERROR_STATUS_MAX = 499;
const SERVER_ERROR_STATUS_MIN = 500;
const EXPECTED_SUCCESS_RESPONSE = '2xx';
const EXPECTED_CLIENT_ERROR_RESPONSE = '4xx';

export async function runDataDrivenTests(
  method: Method,
  url: string,
  headers: Record<string, string>,
  body: any,
  fieldMappings: Record<string, string>,
  queryMappings: Record<string, string>,
  messageType: string,
  protoFile: File | null,
  setCurrentTest: (value: number) => void,
  setTestCount: (count: number) => void,
): Promise<Test[]> {
  // Calculate total number of tests (BODY + QUERY parameters)
  let testCount = 0;
  for (const [, dataType] of Object.entries(fieldMappings)) {
    if (dataType === 'do-not-test' || dataType === 'random32') continue;
    testCount += (datasets[dataType] || []).length;
  }

  for (const [, dataType] of Object.entries(queryMappings)) {
    if (dataType === 'do-not-test' || dataType === 'random32') continue;
    testCount += (datasets[dataType] || []).length;
  }

  setTestCount(1 + testCount);

  const results: Test[] = [];

  // Always send the original request first as baseline test
  try {
    const requestStartTime = performance.now();
    const originalResponse = await window.electronAPI.sendHttp({
      url,
      method,
      headers,
      body,
    });
    const requestEndTime = performance.now();

    results.push({
      actual: originalResponse.status,
      expected: EXPECTED_SUCCESS_RESPONSE,
      field: '(original request)',
      request: { url, method, headers, body },
      response:
        typeof originalResponse.body === 'string'
          ? originalResponse.body
          : JSON.stringify(originalResponse.body, null, 2),
      responseTime: requestEndTime - requestStartTime,
      status: originalResponse.status.startsWith('2') ? TestStatus.Pass : TestStatus.Fail,
      value: body,
    });
  } catch (error) {
    results.push({
      actual: 'Error',
      expected: EXPECTED_SUCCESS_RESPONSE,
      field: '(original request)',
      request: { url, method, headers, body },
      response: String(error),
      responseTime: 0,
      status: TestStatus.Bug,
      value: body,
    });
  }

  let currentTestCounter = 0;
  for (const [fieldName, dataType] of Object.entries(fieldMappings)) {
    if (dataType === 'do-not-test') continue;

    const testDataset =
      dataType === 'random32' || dataType === 'randomInt' ? [{ dynamic: true, valid: true }] : datasets[dataType] || [];

    for (const testData of testDataset) {
      currentTestCounter++;
      setCurrentTest(currentTestCounter);

      // Extract test value from dataset
      const testValue = (testData as any).value;

      // Create deep copy of original body to avoid mutation
      const modifiedRequestBody = JSON.parse(JSON.stringify(body));
      const finalTestValue =
        dataType === 'randomInt'
          ? generateRandomInteger()
          : dataType === 'random32'
            ? generateRandomString()
            : dataType === 'randomEmail'
              ? generateRandomEmail()
              : testValue;

      setDeepObjectProperty(modifiedRequestBody, fieldName, finalTestValue);

      // For each request, regenerate all random values to ensure fresh data
      for (const [fieldKey, fieldType] of Object.entries(fieldMappings)) {
        if (fieldType === 'random32') modifiedRequestBody[fieldKey] = generateRandomString();
        if (fieldType === 'randomInt') modifiedRequestBody[fieldKey] = generateRandomInteger();
        if (fieldType === 'randomEmail') modifiedRequestBody[fieldKey] = generateRandomEmail();
      }

      let requestPayload: any = modifiedRequestBody;
      if (protoFile && messageType) {
        try {
          requestPayload = encodeMessage(messageType, modifiedRequestBody);
        } catch (err) {
          const currentTestValue = 'value' in testData ? testData.value : null;
          results.push({
            actual: 'Encode error',
            expected: testData.valid ? EXPECTED_SUCCESS_RESPONSE : EXPECTED_CLIENT_ERROR_RESPONSE,
            field: fieldName,
            request: { url, method, headers, body: modifiedRequestBody },
            response: String(err),
            responseTime: 0,
            status: TestStatus.Bug,
            value: currentTestValue,
          });
          continue;
        }
      }

      try {
        const requestStart = performance.now();
        const httpResponse = await window.electronAPI.sendHttp({
          url,
          method,
          headers,
          body: requestPayload,
        });
        const requestEnd = performance.now();
        const responseTime = requestEnd - requestStart;

        // Parse HTTP status code from response
        let httpStatusCode = 0;
        if (httpResponse.status) {
          const statusParts = httpResponse.status.split(' ');
          httpStatusCode = parseInt(statusParts[0], 10);
        }

        const isSuccessfulResponse = httpStatusCode >= SUCCESS_STATUS_MIN && httpStatusCode <= SUCCESS_STATUS_MAX;

        // Format response text for display
        let formattedResponseText: string;
        if (typeof httpResponse.body === 'string') formattedResponseText = httpResponse.body;
        else {
          try {
            formattedResponseText = JSON.stringify(httpResponse.body, null, 2);
          } catch {
            formattedResponseText = String(httpResponse.body);
          }
        }

        let decodedResponse: string | null = null;
        if (protoFile && messageType) {
          try {
            const decodedObject = decodeMessage(messageType, new Uint8Array(httpResponse.body));
            decodedResponse = JSON.stringify(decodedObject, null, 2);
          } catch {
            decodedResponse = null;
          }
        }

        let testStatus = TestStatus.Fail;
        if (testData.valid) {
          // Expecting successful response (2xx)
          if (isSuccessfulResponse) testStatus = TestStatus.Pass;
        } else {
          // Expecting client error response (4xx)
          if (httpStatusCode >= CLIENT_ERROR_STATUS_MIN && httpStatusCode <= CLIENT_ERROR_STATUS_MAX)
            testStatus = TestStatus.Pass;
          else if (isSuccessfulResponse) testStatus = TestStatus.Fail;
          else if (httpStatusCode >= SERVER_ERROR_STATUS_MIN) testStatus = TestStatus.Bug;
        }

        results.push({
          actual: httpResponse.status,
          expected: testData.valid ? EXPECTED_SUCCESS_RESPONSE : EXPECTED_CLIENT_ERROR_RESPONSE,
          decoded: decodedResponse,
          field: fieldName,
          request: { url, method, headers, body: modifiedRequestBody },
          response: formattedResponseText,
          responseTime,
          status: testStatus,
          value: testValue,
        });
      } catch (error) {
        results.push({
          actual: 'Error',
          expected: testData.valid ? EXPECTED_SUCCESS_RESPONSE : EXPECTED_CLIENT_ERROR_RESPONSE,
          field: fieldName,
          request: { url, method, headers, body: modifiedRequestBody },
          response: String(error),
          responseTime: 0,
          status: TestStatus.Bug,
          value: testValue,
        });
      }
    }
  }

  // Test query parameters with various data types
  for (const [queryParam, dataType] of Object.entries(queryMappings)) {
    if (dataType === 'do-not-test') continue;
    const queryTestDataset = datasets[dataType] || [];

    for (const queryTestData of queryTestDataset) {
      currentTestCounter++;
      setCurrentTest(currentTestCounter);

      const queryTestValue = queryTestData.value;
      const urlWithQueryParam = new URL(url);
      urlWithQueryParam.searchParams.set(queryParam, String(queryTestValue));

      const queryRequestStart = performance.now();
      const queryResponse = await window.electronAPI.sendHttp({
        url: urlWithQueryParam.toString(),
        method,
        headers,
        body,
      });
      const queryRequestEnd = performance.now();
      const queryResponseTime = queryRequestEnd - queryRequestStart;

      const queryStatusCode = parseInt(queryResponse.status?.split(' ')[0] || '0', 10);
      const isQueryResponseSuccessful = queryStatusCode >= SUCCESS_STATUS_MIN && queryStatusCode <= SUCCESS_STATUS_MAX;
      const queryTestStatus =
        (queryTestData.valid && isQueryResponseSuccessful) ||
        (!queryTestData.valid &&
          queryStatusCode >= CLIENT_ERROR_STATUS_MIN &&
          queryStatusCode <= CLIENT_ERROR_STATUS_MAX)
          ? TestStatus.Pass
          : TestStatus.Fail;

      results.push({
        actual: queryResponse.status,
        expected: queryTestData.valid ? EXPECTED_SUCCESS_RESPONSE : EXPECTED_CLIENT_ERROR_RESPONSE,
        field: `query.${queryParam}`,
        request: { url: urlWithQueryParam.toString(), method, headers, body },
        response: queryResponse.body,
        responseTime: queryResponseTime,
        status: queryTestStatus,
        value: queryTestValue,
      });
    }
  }

  return results;
}
