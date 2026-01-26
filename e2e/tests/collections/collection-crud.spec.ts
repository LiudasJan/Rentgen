import { test, expect } from '../../fixtures';
import { AppPage, RequestBuilderPage, SidebarPage } from '../../pages';
import { TEST_CONSTANTS, MOCK_ENDPOINTS } from '../../fixtures/test-constants';

const { TEST_FOLDER_NAME } = TEST_CONSTANTS.folders;

/**
 * Collection CRUD Tests
 * Tests collection folder operations using page objects
 * All waits are intelligent (element-based) rather than hardcoded timeouts
 */
test.describe('Collection CRUD Operations', () => {
  let appPage: AppPage;
  let requestBuilder: RequestBuilderPage;
  let sidebar: SidebarPage;

  test.beforeEach(async ({ page, electronApp }) => {
    appPage = new AppPage(page, electronApp);
    requestBuilder = new RequestBuilderPage(page, electronApp);
    sidebar = new SidebarPage(page, electronApp);

    await appPage.waitForAppReady();
    await appPage.selectTab('collections');
  });

  test.afterEach(async () => {
    // Cleanup: delete test folder if it exists
    try {
      await sidebar.deleteFolderIfExists(TEST_FOLDER_NAME);
    } catch {
      // Ignore cleanup errors
    }
  });

  test('should create a new folder', async () => {
    const initialCount = await sidebar.getFolderCount();

    // Create folder using page object
    await sidebar.createFolder();

    // Verify folder was created
    const newCount = await sidebar.getFolderCount();
    expect(newCount).toBeGreaterThan(initialCount);

    await sidebar.deleteFolderByIndex(0);
  });

  test('should rename a folder', async () => {
    // Create and rename folder using page object methods
    await sidebar.createFolder();
    await sidebar.renameFolderByIndex(0, TEST_FOLDER_NAME);

    // Verify folder is renamed
    const folderExists = await sidebar.folderExists(TEST_FOLDER_NAME);
    expect(folderExists).toBe(true);

    // Cleanup
    await sidebar.deleteFolderIfExists(TEST_FOLDER_NAME);
  });

  test('should delete an empty folder', async () => {
    // Create a new folder
    await sidebar.createFolder();
    const countAfterCreate = await sidebar.getFolderCount();

    // Delete the first folder
    await sidebar.deleteFolderByIndex(0);

    // Verify folder count decreased
    await expect(async () => {
      const countAfterDelete = await sidebar.getFolderCount();
      expect(countAfterDelete).toBeLessThan(countAfterCreate);
    }).toPass({ timeout: TEST_CONSTANTS.timeouts.ELEMENT_VISIBLE });
  });

  test('should save request to folder and delete folder with requests', async ({ page, mockServer }) => {
    // Create and rename folder
    await sidebar.createFolderWithName(TEST_FOLDER_NAME);

    // Select the folder
    await sidebar.selectFolderByIndex(0);

    // Save a Pokemon API request using mock server
    await requestBuilder.setUrl(`${mockServer.baseUrl}${MOCK_ENDPOINTS.POKEMON('pikachu')}`);
    await requestBuilder.save();

    // Verify request is saved
    await expect(page.getByText('pikachu').first()).toBeVisible({
      timeout: TEST_CONSTANTS.timeouts.ELEMENT_VISIBLE,
    });

    // Delete the folder (should show confirmation for non-empty folder)
    await sidebar.deleteFolderIfExists(TEST_FOLDER_NAME);

    // Verify folder is gone
    const folderExists = await sidebar.folderExists(TEST_FOLDER_NAME);
    expect(folderExists).toBe(false);
  });

  test('should select saved request from collection', async ({ page, mockServer }) => {
    // Create folder and save request
    await sidebar.createFolder();
    await sidebar.selectFolderByIndex(0);

    // Save a request using mock server
    await requestBuilder.setUrl(`${mockServer.baseUrl}${MOCK_ENDPOINTS.POKEMON('charmander')}`);
    await requestBuilder.save();

    // Verify the saved request appears in the sidebar
    await expect(page.getByText('charmander').first()).toBeVisible({
      timeout: TEST_CONSTANTS.timeouts.ELEMENT_VISIBLE,
    });

    // Click on the saved request in sidebar to select it
    await page.getByText('charmander').first().click();

    // Verify the request is still visible (selected state)
    await expect(page.getByText('charmander').first()).toBeVisible();

    // Cleanup
    await sidebar.deleteFolderByIndex(0);
  });

  test('should save multiple Pokemon requests to a folder', async ({ page, mockServer }) => {
    // Create folder
    await sidebar.createFolder();
    await sidebar.selectFolderByIndex(0);

    // Save first Pokemon request
    await requestBuilder.setUrl(`${mockServer.baseUrl}${MOCK_ENDPOINTS.POKEMON('bulbasaur')}`);
    await requestBuilder.save();

    // Save second Pokemon request
    await requestBuilder.setUrl(`${mockServer.baseUrl}${MOCK_ENDPOINTS.POKEMON('squirtle')}`);
    await requestBuilder.save();

    // Verify both requests are visible
    await expect(page.getByText('bulbasaur').first()).toBeVisible({
      timeout: TEST_CONSTANTS.timeouts.ELEMENT_VISIBLE,
    });
    await expect(page.getByText('squirtle').first()).toBeVisible({
      timeout: TEST_CONSTANTS.timeouts.ELEMENT_VISIBLE,
    });

    // Cleanup
    await sidebar.deleteFolderByIndex(0);
  });
});
