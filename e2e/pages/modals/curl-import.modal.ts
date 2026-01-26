import { Page, Locator } from 'playwright';

export class CurlImportModal {
  constructor(private readonly page: Page) {}

  get modal(): Locator {
    return this.page.getByRole('dialog');
  }

  get curlInput(): Locator {
    return this.modal.getByPlaceholder(/cURL|curl/i);
  }

  get importButton(): Locator {
    return this.modal.getByRole('button', { name: 'Import', exact: true });
  }

  get cancelButton(): Locator {
    return this.modal.getByRole('button', { name: 'Cancel' });
  }

  async importCurl(curlCommand: string): Promise<void> {
    await this.curlInput.fill(curlCommand);
    await this.importButton.click();
  }

  async cancel(): Promise<void> {
    await this.cancelButton.click();
  }

  async isVisible(): Promise<boolean> {
    return await this.modal.isVisible();
  }
}
