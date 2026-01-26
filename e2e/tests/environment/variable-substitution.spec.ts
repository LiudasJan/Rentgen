import { test, expect } from '../../fixtures';
import { AppPage, RequestBuilderPage } from '../../pages';

/**
 * Environment Variable Substitution Tests
 * Tests basic variable syntax display in various fields
 * Simplified tests focusing on UI functionality
 */
test.describe('Environment Variable Substitution', () => {
  let appPage: AppPage;
  let requestBuilder: RequestBuilderPage;

  test.beforeEach(async ({ page, electronApp }) => {
    appPage = new AppPage(page, electronApp);
    requestBuilder = new RequestBuilderPage(page, electronApp);

    await appPage.waitForAppReady();
  });

  test('should display variable syntax in URL input', async ({ mockServer }) => {
    // Enter URL with variable syntax using mock server base
    await requestBuilder.setUrl(`${mockServer.baseUrl}/api/pokemon/{{pokemon_name}}`);

    // Verify the URL shows the variable syntax
    const urlValue = await requestBuilder.urlInput.inputValue();
    expect(urlValue).toContain('{{pokemon_name}}');
  });

  test('should display multiple variables in URL', async () => {
    // Enter URL with multiple variables
    await requestBuilder.setUrl('{{base_url}}/pokemon/{{pokemon_id}}');

    // Verify the URL shows both variable syntaxes
    const urlValue = await requestBuilder.urlInput.inputValue();
    expect(urlValue).toContain('{{base_url}}');
    expect(urlValue).toContain('{{pokemon_id}}');
  });

  test('should display variable syntax in headers', async () => {
    // Enter header with variable syntax
    await requestBuilder.setHeaders('Authorization: Bearer {{api_token}}');

    // Verify the header shows the variable syntax
    const headersValue = await requestBuilder.headersInput.inputValue();
    expect(headersValue).toContain('{{api_token}}');
  });

  test('should display variable syntax in body', async () => {
    // Enter body with variable syntax
    await requestBuilder.setBody('{"pokemon": "{{pokemon_name}}", "level": {{level}}}');

    // Verify the body shows the variable syntax
    const bodyValue = await requestBuilder.bodyInput.inputValue();
    expect(bodyValue).toContain('{{pokemon_name}}');
    expect(bodyValue).toContain('{{level}}');
  });

  test('should preserve variable syntax after setting other fields', async ({ mockServer }) => {
    // Set URL with variable
    await requestBuilder.setUrl(`${mockServer.baseUrl}/api/pokemon/{{pokemon}}`);

    // Set headers
    await requestBuilder.setHeaders('X-Custom: {{header_value}}');

    // Verify URL still has variable
    const urlValue = await requestBuilder.urlInput.inputValue();
    expect(urlValue).toContain('{{pokemon}}');

    // Verify header has variable
    const headersValue = await requestBuilder.headersInput.inputValue();
    expect(headersValue).toContain('{{header_value}}');
  });
});
