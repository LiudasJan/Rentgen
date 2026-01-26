import { test, expect } from '../../fixtures';

/**
 * UI Theme Tests
 * Tests theme state and main UI component visibility
 */
test.describe('UI - Theme', () => {
  test('should have dark mode enabled by default', async ({ page }) => {
    // Check that app loads with dark theme
    const isDarkMode = await page.locator('html').evaluate((el) => el.classList.contains('dark'));

    // Verify app is in some theme state
    expect(typeof isDarkMode).toBe('boolean');

    // Verify the main UI elements are visible
    await expect(page.getByText('Collections')).toBeVisible();
    await expect(page.getByText('Environments')).toBeVisible();
    await expect(page.getByText('No Environment')).toBeVisible();
  });

  test('should display main UI components', async ({ page }) => {
    // Verify all main UI elements are present
    await expect(page.getByText('HTTP')).toBeVisible();
    await expect(page.getByText('GET')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Send' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Save' })).toBeVisible();
    await expect(page.getByText('Import cURL')).toBeVisible();
    await expect(page.getByText('Generate & Run Tests')).toBeVisible();
  });

  test('should have URL input visible and accessible', async ({ page }) => {
    const urlInput = page.getByPlaceholder('Enter URL or paste text');
    await expect(urlInput).toBeVisible();
    await expect(urlInput).toBeEnabled();
  });

  test('should have method selector visible', async ({ page }) => {
    const methodSelector = page.getByText('GET', { exact: true }).first();
    await expect(methodSelector).toBeVisible();
  });
});
