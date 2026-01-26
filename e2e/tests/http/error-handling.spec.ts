import { test, expect } from '../../fixtures';
import { AppPage, RequestBuilderPage, ResponsePanelPage } from '../../pages';
import { TEST_CONSTANTS, MOCK_ENDPOINTS } from '../../fixtures/test-constants';

/**
 * HTTP Error Handling Tests
 * Tests 4xx and 5xx error responses using mock server
 */
test.describe('HTTP Error Handling', () => {
  let appPage: AppPage;
  let requestBuilder: RequestBuilderPage;
  let responsePanel: ResponsePanelPage;

  test.beforeEach(async ({ page, electronApp }) => {
    appPage = new AppPage(page, electronApp);
    requestBuilder = new RequestBuilderPage(page, electronApp);
    responsePanel = new ResponsePanelPage(page, electronApp);

    await appPage.waitForAppReady();
  });

  test('should handle 404 Not Found error', async ({ mockServer }) => {
    // Request non-existent Pokemon
    await requestBuilder.setUrl(`${mockServer.baseUrl}${MOCK_ENDPOINTS.POKEMON('nonexistent-pokemon-12345')}`);
    await requestBuilder.send();

    // Wait for error response
    await responsePanel.waitForResponse(TEST_CONSTANTS.timeouts.RESPONSE_WAIT);
    const statusCode = await responsePanel.getStatusCode();
    expect(statusCode).toBe(404);
  });

  test('should handle 400 Bad Request error', async ({ mockServer }) => {
    await requestBuilder.setUrl(`${mockServer.baseUrl}${MOCK_ENDPOINTS.ERROR_400}`);
    await requestBuilder.send();

    await responsePanel.waitForResponse(TEST_CONSTANTS.timeouts.RESPONSE_WAIT);
    const statusCode = await responsePanel.getStatusCode();
    expect(statusCode).toBe(400);
  });

  test('should handle 401 Unauthorized error', async ({ mockServer }) => {
    await requestBuilder.setUrl(`${mockServer.baseUrl}${MOCK_ENDPOINTS.ERROR_401}`);
    await requestBuilder.send();

    await responsePanel.waitForResponse(TEST_CONSTANTS.timeouts.RESPONSE_WAIT);
    const statusCode = await responsePanel.getStatusCode();
    expect(statusCode).toBe(401);
  });

  test('should handle 403 Forbidden error', async ({ mockServer }) => {
    await requestBuilder.setUrl(`${mockServer.baseUrl}${MOCK_ENDPOINTS.ERROR_403}`);
    await requestBuilder.send();

    await responsePanel.waitForResponse(TEST_CONSTANTS.timeouts.RESPONSE_WAIT);
    const statusCode = await responsePanel.getStatusCode();
    expect(statusCode).toBe(403);
  });

  test('should handle 500 Internal Server Error', async ({ mockServer }) => {
    await requestBuilder.setUrl(`${mockServer.baseUrl}${MOCK_ENDPOINTS.ERROR_500}`);
    await requestBuilder.send();

    await responsePanel.waitForResponse(TEST_CONSTANTS.timeouts.RESPONSE_WAIT);
    const statusCode = await responsePanel.getStatusCode();
    expect(statusCode).toBe(500);
  });

  test('should handle 502 Bad Gateway error', async ({ mockServer }) => {
    await requestBuilder.setUrl(`${mockServer.baseUrl}${MOCK_ENDPOINTS.ERROR_502}`);
    await requestBuilder.send();

    await responsePanel.waitForResponse(TEST_CONSTANTS.timeouts.RESPONSE_WAIT);
    const statusCode = await responsePanel.getStatusCode();
    expect(statusCode).toBe(502);
  });

  test('should handle 503 Service Unavailable error', async ({ mockServer }) => {
    await requestBuilder.setUrl(`${mockServer.baseUrl}${MOCK_ENDPOINTS.ERROR_503}`);
    await requestBuilder.send();

    await responsePanel.waitForResponse(TEST_CONSTANTS.timeouts.RESPONSE_WAIT);
    const statusCode = await responsePanel.getStatusCode();
    expect(statusCode).toBe(503);
  });
});
