import { ElectronApplication, Locator, Page, expect } from '@playwright/test';

export abstract class BasePage {
  constructor(
    protected readonly page: Page,
    protected readonly electronApp: ElectronApplication
  ) {}

  async waitForReady(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
  }

  async screenshot(name: string): Promise<void> {
    await this.page.screenshot({ path: `e2e/screenshots/${name}.png` });
  }

  /**
   * Wait for the count of matching elements to change from a previous value
   * Uses Playwright's toPass() for retry logic instead of hardcoded waits
   */
  async waitForCountChange(
    locator: Locator,
    previousCount: number,
    options: { timeout?: number; comparison?: 'greater' | 'less' | 'notEqual' } = {}
  ): Promise<void> {
    const { timeout = 2000, comparison = 'greater' } = options;

    await expect(async () => {
      const currentCount = await locator.count();
      switch (comparison) {
        case 'greater':
          expect(currentCount).toBeGreaterThan(previousCount);
          break;
        case 'less':
          expect(currentCount).toBeLessThan(previousCount);
          break;
        case 'notEqual':
          expect(currentCount).not.toBe(previousCount);
          break;
      }
    }).toPass({ timeout });
  }
}
