import { ElectronApplication, Locator, Page } from 'playwright';
import { BasePage } from './base.page';

export class AppPage extends BasePage {
  constructor(page: Page, electronApp: ElectronApplication) {
    super(page, electronApp);
  }

  get collectionsTab(): Locator {
    return this.page.getByText('Collections', { exact: true });
  }

  get environmentsTab(): Locator {
    return this.page.getByText('Environments', { exact: true });
  }

  get newFolderButton(): Locator {
    return this.page.getByTitle('New Folder');
  }

  get newEnvironmentButton(): Locator {
    return this.page.getByText('New Environment');
  }

  async waitForAppReady(): Promise<void> {
    await this.waitForReady();
    await this.collectionsTab.waitFor({ state: 'visible', timeout: 15000 });
    await this.page.getByPlaceholder('Enter URL or paste text').waitFor({ state: 'visible', timeout: 10000 });
  }

  /**
   * Select a tab in the sidebar (Collections or Environments)
   * Waits for the appropriate action button to confirm tab is active
   */
  async selectTab(tab: 'collections' | 'environments'): Promise<void> {
    if (tab === 'collections') {
      await this.collectionsTab.click();
      await this.newFolderButton.waitFor({ state: 'visible' });
    } else {
      await this.environmentsTab.click();
      await this.newEnvironmentButton.waitFor({ state: 'visible' });
    }
  }

  /**
   * Check if we're currently on the collections tab
   */
  async isCollectionsTabActive(): Promise<boolean> {
    return await this.newFolderButton.isVisible();
  }

  /**
   * Check if we're currently on the environments tab
   */
  async isEnvironmentsTabActive(): Promise<boolean> {
    return await this.newEnvironmentButton.isVisible();
  }
}
