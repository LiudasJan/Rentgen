import { Method } from 'axios';
import { datasets } from '../constants/datasets';
import { Test, TestStatus } from '../types';
import {
  convertFormEntriesToUrlEncoded,
  decodeMessage,
  encodeMessage,
  generateRandomEmail,
  generateRandomInteger,
  generateRandomString,
  getHeaderValue,
  parseFormData,
  setDeepObjectProperty,
  throwError,
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
  body: string,
  fieldMappings: Record<string, string>,
  queryMappings: Record<string, string>,
  messageType: string,
  protoFile: File | null,
  setCurrentTest: (value: number) => void,
  setTestCount: (count: number) => void,
): Promise<Test[]> {
  const contentType = getHeaderValue(headers, 'content-type');
  const isForm = /application\/x-www-form-urlencoded/i.test(contentType);

  let parsedBody = null;
  let formEntries: Array<[string, string]> = [];

  if (isForm) formEntries = parseFormData(String(body));
  else
    try {
      parsedBody = JSON.parse(body);
    } catch {
      return [];
    }

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

  setTestCount(1 + testCount);

  const results: Test[] = [];
  const data = isForm ? convertFormEntriesToUrlEncoded(formEntries) : parsedBody;

  // Always send the original request first as baseline test
  try {
    const requestStartTime = performance.now();
    const originalResponse = await window.electronAPI.sendHttp({
      url,
      method,
      headers,
      body: data,
    });
    const requestEndTime = performance.now();

    results.push({
      actual: originalResponse.status,
      expected: EXPECTED_SUCCESS_RESPONSE,
      field: '(original request)',
      request: { url, method, headers, body: data },
      response:
        typeof originalResponse.body === 'string'
          ? originalResponse.body
          : JSON.stringify(originalResponse.body, null, 2),
      responseTime: requestEndTime - requestStartTime,
      status: originalResponse.status?.startsWith('2') ? TestStatus.Pass : TestStatus.Fail,
      value: isForm ? Object.fromEntries(formEntries) : parsedBody,
    });
  } catch (error) {
    results.push({
      actual: 'Error',
      expected: EXPECTED_SUCCESS_RESPONSE,
      field: '(original request)',
      request: { url, method, headers, body: data },
      response: String(error),
      responseTime: 0,
      status: TestStatus.Bug,
      value: isForm ? Object.fromEntries(formEntries) : parsedBody,
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
        setCurrentTest(currentTestCounter);

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

        const encodedFormData = convertFormEntriesToUrlEncoded(modifiedFormEntries);

        try {
          const requestStart = performance.now();
          const httpResponse = await window.electronAPI.sendHttp({
            url,
            method,
            headers,
            body: encodedFormData,
          });
          const requestEnd = performance.now();
          const responseTime = requestEnd - requestStart;

          const httpStatusCode = parseInt(httpResponse.status?.split(' ')[0] || '0', 10);
          const isSuccessfulResponse = httpStatusCode >= SUCCESS_STATUS_MIN && httpStatusCode <= SUCCESS_STATUS_MAX;
          const testStatus =
            (testData.valid && isSuccessfulResponse) ||
            (!testData.valid && httpStatusCode >= CLIENT_ERROR_STATUS_MIN && httpStatusCode <= CLIENT_ERROR_STATUS_MAX)
              ? TestStatus.Pass
              : httpStatusCode >= SERVER_ERROR_STATUS_MIN
                ? TestStatus.Bug
                : TestStatus.Fail;

          results.push({
            actual: httpResponse.status,
            expected: testData.valid ? EXPECTED_SUCCESS_RESPONSE : EXPECTED_CLIENT_ERROR_RESPONSE,
            field: fieldName,
            request: { url, method, headers, body: encodedFormData },
            response:
              typeof httpResponse.body === 'string' ? httpResponse.body : JSON.stringify(httpResponse.body, null, 2),
            responseTime,
            status: testStatus,
            value: testValue,
          });
        } catch (error) {
          results.push({
            actual: 'Error',
            expected: testData.valid ? EXPECTED_SUCCESS_RESPONSE : EXPECTED_CLIENT_ERROR_RESPONSE,
            field: fieldName,
            request: { url, method, headers, body: encodedFormData },
            response: String(error),
            responseTime: 0,
            status: TestStatus.Bug,
            value: testValue,
          });
        }
      }
      continue;
    }

    for (const testData of testDataset) {
      currentTestCounter++;
      setCurrentTest(currentTestCounter);

      // Extract test value from dataset
      const testValue = (testData as any).value;

      // Create deep copy of original body to avoid mutation
      const modifiedRequestBody =
        parsedBody && typeof parsedBody === 'object'
          ? JSON.parse(JSON.stringify(parsedBody))
          : throwError('Parsed body is not an object');
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
        } catch (error) {
          results.push({
            actual: 'Encode error',
            expected: testData.valid ? EXPECTED_SUCCESS_RESPONSE : EXPECTED_CLIENT_ERROR_RESPONSE,
            field: fieldName,
            request: { url, method, headers, body: modifiedRequestBody },
            response: String(error),
            responseTime: 0,
            status: TestStatus.Bug,
            value: testValue,
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

        // Parse HTTP status code from response
        const httpStatusCode = parseInt(httpResponse.status?.split(' ')[0] || '0', 10);
        const isSuccessfulResponse = httpStatusCode >= SUCCESS_STATUS_MIN && httpStatusCode <= SUCCESS_STATUS_MAX;
        const testStatus =
          (testData.valid && isSuccessfulResponse) ||
          (!testData.valid && httpStatusCode >= CLIENT_ERROR_STATUS_MIN && httpStatusCode <= CLIENT_ERROR_STATUS_MAX)
            ? TestStatus.Pass
            : httpStatusCode >= SERVER_ERROR_STATUS_MIN
              ? TestStatus.Bug
              : TestStatus.Fail;

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
      const queryRequestBody = isForm ? convertFormEntriesToUrlEncoded(formEntries) : parsedBody;
      const queryResponse = await window.electronAPI.sendHttp({
        url: urlWithQueryParam.toString(),
        method,
        headers,
        body: queryRequestBody,
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
        request: { url: urlWithQueryParam.toString(), method, headers, body: queryRequestBody },
        response:
          typeof queryResponse.body === 'string' ? queryResponse.body : JSON.stringify(queryResponse.body, null, 2),
        responseTime: queryResponseTime,
        status: queryTestStatus,
        value: queryTestValue,
      });
    }
  }

  return results;
}
