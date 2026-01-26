import { test, expect } from '../../fixtures';
import { AppPage, EnvironmentPage } from '../../pages';
import { TEST_CONSTANTS } from '../../fixtures/test-constants';

/**
 * Environment CRUD Tests
 * Tests environment creation with proper cleanup
 * Uses EnvironmentPage object for all interactions
 */
test.describe('Environment CRUD Operations', () => {
  let appPage: AppPage;
  let environmentPage: EnvironmentPage;
  let testEnvName: string;

  test.beforeEach(async ({ page, electronApp }) => {
    appPage = new AppPage(page, electronApp);
    environmentPage = new EnvironmentPage(page, electronApp);

    await appPage.waitForAppReady();
    await appPage.selectTab('environments');

    // Generate unique name for this test
    testEnvName = TEST_CONSTANTS.environments.generateUniqueName();
  });

  test.afterEach(async () => {
    // Cleanup: delete test environment if it exists
    try {
      await environmentPage.deleteEnvironmentIfExists(testEnvName);
    } catch {
      // Ignore cleanup errors
    }
  });

  test('should create a new environment', async ({ page }) => {
    // Create environment using page object
    await environmentPage.createEnvironment(testEnvName);

    // Verify environment appears in the list
    await expect(page.getByText(testEnvName).first()).toBeVisible({
      timeout: TEST_CONSTANTS.timeouts.ELEMENT_VISIBLE,
    });
    // Cleanup handled by afterEach
  });

  test('should create environment with variables', async ({ page }) => {
    const variableName = TEST_CONSTANTS.variables.POKEMON_NAME.key;
    const variableValue = TEST_CONSTANTS.variables.POKEMON_NAME.value;

    // Create environment with variable
    await environmentPage.newEnvironmentButton.click();
    await environmentPage.nameInput.waitFor({ state: 'visible' });
    await environmentPage.nameInput.fill(testEnvName);

    // Add a variable
    await environmentPage.addVariable(variableName, variableValue);

    // Click Create
    await environmentPage.createButton.click();

    // Verify environment is created
    await expect(page.getByText(testEnvName).first()).toBeVisible({
      timeout: TEST_CONSTANTS.timeouts.ELEMENT_VISIBLE,
    });
    // Cleanup handled by afterEach
  });

  test('should display environment list', async ({ page }) => {
    // Just verify the Environments panel is functional
    // Should show "New Environment" button
    await expect(environmentPage.newEnvironmentButton).toBeVisible();

    // Should be on Environments tab
    await expect(page.getByText('Environments', { exact: true })).toBeVisible();
  });

  test('should show environment editor on click', async ({ page }) => {
    // Create environment first
    await environmentPage.createEnvironment(testEnvName);

    // Click on the environment to edit it
    await environmentPage.editEnvironment(testEnvName);

    // Verify we're in edit mode
    await expect(page.getByText('Edit Environment')).toBeVisible({
      timeout: TEST_CONSTANTS.timeouts.ELEMENT_VISIBLE,
    });
    // Cleanup handled by afterEach
  });
});
