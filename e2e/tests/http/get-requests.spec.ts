import { test, expect } from '../../fixtures';
import { AppPage, RequestBuilderPage, ResponsePanelPage } from '../../pages';
import { TEST_CONSTANTS, MOCK_ENDPOINTS } from '../../fixtures/test-constants';

/**
 * HTTP GET Request Tests
 * Uses mock server for all tests (no external API dependencies)
 */
test.describe('HTTP GET Requests', () => {
  let appPage: AppPage;
  let requestBuilder: RequestBuilderPage;
  let responsePanel: ResponsePanelPage;

  test.beforeEach(async ({ page, electronApp }) => {
    appPage = new AppPage(page, electronApp);
    requestBuilder = new RequestBuilderPage(page, electronApp);
    responsePanel = new ResponsePanelPage(page, electronApp);

    await appPage.waitForAppReady();
  });

  test('should send GET request and receive 200 OK', async ({ page, mockServer }) => {
    // Send GET request to Pokemon API mock
    await requestBuilder.setUrl(`${mockServer.baseUrl}${MOCK_ENDPOINTS.POKEMON('pikachu')}`);
    await requestBuilder.send();

    // Wait for and verify response
    await responsePanel.waitForResponse(TEST_CONSTANTS.timeouts.RESPONSE_WAIT);
    const statusCode = await responsePanel.getStatusCode();
    expect(statusCode).toBe(200);

    // Verify response body section is visible and contains data
    await expect(page.getByText('abilities')).toBeVisible({
      timeout: TEST_CONSTANTS.timeouts.ELEMENT_VISIBLE,
    });
  });

  test('should handle GET request with query parameters', async ({ page, mockServer }) => {
    // Pokemon API supports limit and offset parameters
    await requestBuilder.setUrl(`${mockServer.baseUrl}${MOCK_ENDPOINTS.POKEMON_LIST}?limit=5&offset=0`);
    await requestBuilder.send();

    await responsePanel.waitForResponse(TEST_CONSTANTS.timeouts.RESPONSE_WAIT);
    const statusCode = await responsePanel.getStatusCode();
    expect(statusCode).toBe(200);

    // Verify response contains results (visible in the response)
    await expect(page.getByText('"results"')).toBeVisible({
      timeout: TEST_CONSTANTS.timeouts.ELEMENT_VISIBLE,
    });
  });

  test('should display response headers', async ({ mockServer }) => {
    await requestBuilder.setUrl(`${mockServer.baseUrl}${MOCK_ENDPOINTS.POKEMON('ditto')}`);
    await requestBuilder.send();

    await responsePanel.waitForResponse(TEST_CONSTANTS.timeouts.RESPONSE_WAIT);

    // Verify headers section is visible
    await expect(responsePanel.headersSection).toBeVisible({
      timeout: TEST_CONSTANTS.timeouts.ELEMENT_VISIBLE,
    });
  });

  test('should handle GET request for Pokemon types', async ({ page, mockServer }) => {
    await requestBuilder.setUrl(`${mockServer.baseUrl}${MOCK_ENDPOINTS.POKEMON_TYPE('electric')}`);
    await requestBuilder.send();

    await responsePanel.waitForResponse(TEST_CONSTANTS.timeouts.RESPONSE_WAIT);
    const statusCode = await responsePanel.getStatusCode();
    expect(statusCode).toBe(200);

    // Verify response contains type data (damage_relations field is visible)
    await expect(page.getByText('damage_relations').first()).toBeVisible({
      timeout: TEST_CONSTANTS.timeouts.ELEMENT_VISIBLE,
    });
  });

  test('should handle GET request for Pokemon abilities', async ({ page, mockServer }) => {
    await requestBuilder.setUrl(`${mockServer.baseUrl}${MOCK_ENDPOINTS.POKEMON_ABILITY('static')}`);
    await requestBuilder.send();

    await responsePanel.waitForResponse(TEST_CONSTANTS.timeouts.RESPONSE_WAIT);
    const statusCode = await responsePanel.getStatusCode();
    expect(statusCode).toBe(200);

    // Verify response contains ability data
    await expect(page.getByText('"effect_entries"')).toBeVisible({
      timeout: TEST_CONSTANTS.timeouts.ELEMENT_VISIBLE,
    });
  });
});
