import { test, expect } from '../../fixtures';
import { AppPage, RequestBuilderPage, ResponsePanelPage } from '../../pages';
import { TEST_CONSTANTS } from '../../fixtures/test-constants';

/**
 * HTTP POST Request Tests
 * Uses mock server for all tests (no external API dependencies)
 */
test.describe('HTTP POST Requests', () => {
  let appPage: AppPage;
  let requestBuilder: RequestBuilderPage;
  let responsePanel: ResponsePanelPage;

  test.beforeEach(async ({ page, electronApp }) => {
    appPage = new AppPage(page, electronApp);
    requestBuilder = new RequestBuilderPage(page, electronApp);
    responsePanel = new ResponsePanelPage(page, electronApp);

    await appPage.waitForAppReady();
  });

  test('should send POST request with JSON body', async ({ page, mockServer }) => {
    // Set method to POST
    await requestBuilder.setMethod('POST');
    await requestBuilder.setUrl(`${mockServer.baseUrl}/api/post`);

    // Set JSON body using constants
    const jsonBody = JSON.stringify(TEST_CONSTANTS.payloads.JSON_POST);
    await requestBuilder.setBody(jsonBody);

    // Set Content-Type header
    await requestBuilder.setHeaders('Content-Type: application/json');

    await requestBuilder.send();

    // Wait for response
    await responsePanel.waitForResponse(TEST_CONSTANTS.timeouts.RESPONSE_WAIT);
    const statusCode = await responsePanel.getStatusCode();
    expect(statusCode).toBe(200);

    // Verify response echoes back our data (visible in the json section)
    await expect(page.getByText('"json"').first()).toBeVisible({
      timeout: TEST_CONSTANTS.timeouts.ELEMENT_VISIBLE,
    });
  });

  test('should send POST request with form data', async ({ page, mockServer }) => {
    await requestBuilder.setMethod('POST');
    await requestBuilder.setUrl(`${mockServer.baseUrl}/api/post`);

    // Set form-urlencoded body using constants
    await requestBuilder.setBody(TEST_CONSTANTS.payloads.FORM_DATA);
    await requestBuilder.setHeaders('Content-Type: application/x-www-form-urlencoded');

    await requestBuilder.send();

    await responsePanel.waitForResponse(TEST_CONSTANTS.timeouts.RESPONSE_WAIT);
    const statusCode = await responsePanel.getStatusCode();
    expect(statusCode).toBe(200);

    // Verify response contains form data
    await expect(page.getByText('"form"').first()).toBeVisible({
      timeout: TEST_CONSTANTS.timeouts.ELEMENT_VISIBLE,
    });
  });

  test('should send PUT request', async ({ page, mockServer }) => {
    await requestBuilder.setMethod('PUT');
    await requestBuilder.setUrl(`${mockServer.baseUrl}/api/put`);

    const jsonBody = JSON.stringify(TEST_CONSTANTS.payloads.JSON_PUT);
    await requestBuilder.setBody(jsonBody);
    await requestBuilder.setHeaders('Content-Type: application/json');

    await requestBuilder.send();

    await responsePanel.waitForResponse(TEST_CONSTANTS.timeouts.RESPONSE_WAIT);
    const statusCode = await responsePanel.getStatusCode();
    expect(statusCode).toBe(200);

    // Verify response has json data
    await expect(page.getByText('"json"').first()).toBeVisible({
      timeout: TEST_CONSTANTS.timeouts.ELEMENT_VISIBLE,
    });
  });

  test('should send DELETE request', async ({ mockServer }) => {
    await requestBuilder.setMethod('DELETE');
    await requestBuilder.setUrl(`${mockServer.baseUrl}/api/delete`);

    await requestBuilder.send();

    await responsePanel.waitForResponse(TEST_CONSTANTS.timeouts.RESPONSE_WAIT);
    const statusCode = await responsePanel.getStatusCode();
    expect(statusCode).toBe(200);
  });

  test('should send PATCH request', async ({ page, mockServer }) => {
    await requestBuilder.setMethod('PATCH');
    await requestBuilder.setUrl(`${mockServer.baseUrl}/api/patch`);

    const jsonBody = JSON.stringify(TEST_CONSTANTS.payloads.JSON_PATCH);
    await requestBuilder.setBody(jsonBody);
    await requestBuilder.setHeaders('Content-Type: application/json');

    await requestBuilder.send();

    await responsePanel.waitForResponse(TEST_CONSTANTS.timeouts.RESPONSE_WAIT);
    const statusCode = await responsePanel.getStatusCode();
    expect(statusCode).toBe(200);

    // Verify response has json data
    await expect(page.getByText('"json"').first()).toBeVisible({
      timeout: TEST_CONSTANTS.timeouts.ELEMENT_VISIBLE,
    });
  });
});
