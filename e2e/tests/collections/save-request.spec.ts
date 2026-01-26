import { test, expect } from '../../fixtures';
import { AppPage, RequestBuilderPage, SidebarPage } from '../../pages';
import { TEST_CONSTANTS, MOCK_ENDPOINTS } from '../../fixtures/test-constants';

const { TEST_FOLDER_NAME } = TEST_CONSTANTS.folders;

/**
 * Collection Folder Management Tests
 * Tests folder creation, renaming, and request saving
 * Uses page objects and mock server for reliable tests
 */
test.describe('Collection Folder Management', () => {
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

  test('should create new folder, rename it, and save request', async ({ page, mockServer }) => {
    // Count existing folders before creating new one
    const initialFolderCount = await sidebar.getFolderCount();

    // Step 1: Create a folder
    await sidebar.createFolder();

    // Verify a new folder was created
    const newFolderCount = await sidebar.getFolderCount();
    expect(newFolderCount).toBeGreaterThan(initialFolderCount);

    // Step 2: Rename the folder
    await sidebar.renameFolderByIndex(0, TEST_FOLDER_NAME);

    // Step 3: Select the renamed folder
    await sidebar.selectFolderByIndex(0);

    // Step 4: Create and save a request using mock server
    await requestBuilder.setUrl(`${mockServer.baseUrl}${MOCK_ENDPOINTS.POKEMON('pikachu')}`);
    await requestBuilder.save();

    // Verify the request was saved
    await expect(page.getByText('pikachu').first()).toBeVisible({
      timeout: TEST_CONSTANTS.timeouts.ELEMENT_VISIBLE,
    });

    // Cleanup (best effort)
    await sidebar.deleteFolderByIndex(0);
  });

  test('should delete empty folder', async () => {
    // Create a new folder
    await sidebar.createFolder();

    // Count folders after creation
    const folderCountAfterCreate = await sidebar.getFolderCount();

    // Delete the first folder
    await sidebar.deleteFolderByIndex(0);

    // Verify folder was deleted
    await expect(async () => {
      const folderCountAfterDelete = await sidebar.getFolderCount();
      expect(folderCountAfterDelete).toBeLessThan(folderCountAfterCreate);
    }).toPass({ timeout: TEST_CONSTANTS.timeouts.ELEMENT_VISIBLE });
  });

  test('should save multiple requests to a folder', async ({ page, mockServer }) => {
    // Create a new folder
    await sidebar.createFolder();

    // Select the first folder (newly created)
    await sidebar.selectFolderByIndex(0);

    // Save first request
    await requestBuilder.setUrl(`${mockServer.baseUrl}${MOCK_ENDPOINTS.ECHO}?req=first`);
    await requestBuilder.save();

    // Save second request
    await requestBuilder.setUrl(`${mockServer.baseUrl}${MOCK_ENDPOINTS.ECHO}?req=second`);
    await requestBuilder.save();

    // Verify both requests are visible in sidebar
    await expect(page.getByText('req=first').first()).toBeVisible({
      timeout: TEST_CONSTANTS.timeouts.ELEMENT_VISIBLE,
    });
    await expect(page.getByText('req=second').first()).toBeVisible({
      timeout: TEST_CONSTANTS.timeouts.ELEMENT_VISIBLE,
    });

    // Cleanup: delete the created folder
    await sidebar.deleteFolderByIndex(0);
  });
});
