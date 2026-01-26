import { test, expect } from '../../fixtures';
import { AppPage, RequestBuilderPage, ResponsePanelPage } from '../../pages';
import { TEST_CONSTANTS } from '../../fixtures/test-constants';

/**
 * cURL Import Tests
 * Tests cURL import functionality using mock server
 */
test.describe('cURL Import', () => {
  let appPage: AppPage;
  let requestBuilder: RequestBuilderPage;
  let responsePanel: ResponsePanelPage;

  test.beforeEach(async ({ page, electronApp }) => {
    appPage = new AppPage(page, electronApp);
    requestBuilder = new RequestBuilderPage(page, electronApp);
    responsePanel = new ResponsePanelPage(page, electronApp);

    await appPage.waitForAppReady();
  });

  test('should import simple GET cURL command', async ({ mockServer }) => {
    const curlCommand = TEST_CONSTANTS.curlCommands.SIMPLE_GET(mockServer.baseUrl);

    // Import cURL
    await requestBuilder.importCurl(curlCommand);

    // Verify URL is populated
    const urlValue = await requestBuilder.urlInput.inputValue();
    expect(urlValue).toContain('localhost:3456');
    expect(urlValue).toContain('/api/users');

    // Send the request to verify it works
    await requestBuilder.send();
    await responsePanel.waitForResponse(TEST_CONSTANTS.timeouts.RESPONSE_WAIT);
    const statusCode = await responsePanel.getStatusCode();
    expect(statusCode).toBe(200);
  });

  test('should import cURL with headers', async ({ mockServer }) => {
    const curlCommand = TEST_CONSTANTS.curlCommands.GET_WITH_HEADERS(mockServer.baseUrl);

    await requestBuilder.importCurl(curlCommand);

    // Verify URL is populated
    const urlValue = await requestBuilder.urlInput.inputValue();
    expect(urlValue).toContain('localhost:3456');

    // Verify headers contain expected values
    const headersValue = await requestBuilder.headersInput.inputValue();
    expect(headersValue.toLowerCase()).toContain('accept');

    // Send request and verify it works
    await requestBuilder.send();
    await responsePanel.waitForResponse(TEST_CONSTANTS.timeouts.RESPONSE_WAIT);
    const statusCode = await responsePanel.getStatusCode();
    expect(statusCode).toBe(200);
  });

  test('should import POST cURL with JSON body', async ({ page, mockServer }) => {
    const curlCommand = TEST_CONSTANTS.curlCommands.POST_WITH_BODY(mockServer.baseUrl);

    await requestBuilder.importCurl(curlCommand);

    // Verify URL is populated
    const urlValue = await requestBuilder.urlInput.inputValue();
    expect(urlValue).toContain('/api/echo');

    // Send request
    await requestBuilder.send();
    await responsePanel.waitForResponse(TEST_CONSTANTS.timeouts.RESPONSE_WAIT);
    const statusCode = await responsePanel.getStatusCode();
    expect(statusCode).toBe(200);

    // Verify response contains our data (json section is visible)
    await expect(page.getByText('"json"').first()).toBeVisible({
      timeout: TEST_CONSTANTS.timeouts.ELEMENT_VISIBLE,
    });
  });

  test('should import cURL with query parameters', async ({ mockServer }) => {
    const curlCommand = TEST_CONSTANTS.curlCommands.GET_WITH_PARAMS(mockServer.baseUrl);

    await requestBuilder.importCurl(curlCommand);

    // Verify URL contains query params
    const urlValue = await requestBuilder.urlInput.inputValue();
    expect(urlValue).toContain('limit=3');
    expect(urlValue).toContain('offset=0');

    // Send and verify
    await requestBuilder.send();
    await responsePanel.waitForResponse(TEST_CONSTANTS.timeouts.RESPONSE_WAIT);
    const statusCode = await responsePanel.getStatusCode();
    expect(statusCode).toBe(200);
  });

  test('should import PUT cURL command', async ({ mockServer }) => {
    const curlCommand = TEST_CONSTANTS.curlCommands.PUT_JSON(mockServer.baseUrl);

    await requestBuilder.importCurl(curlCommand);

    // Verify URL
    const urlValue = await requestBuilder.urlInput.inputValue();
    expect(urlValue).toContain('/api/users/1');

    // Send and verify
    await requestBuilder.send();
    await responsePanel.waitForResponse(TEST_CONSTANTS.timeouts.RESPONSE_WAIT);
    const statusCode = await responsePanel.getStatusCode();
    expect(statusCode).toBe(200);
  });
});
