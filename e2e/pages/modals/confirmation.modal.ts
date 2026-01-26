import { Page, Locator } from 'playwright';

export class ConfirmationModal {
  constructor(private readonly page: Page) {}

  get modal(): Locator {
    return this.page.getByRole('dialog');
  }

  get confirmButton(): Locator {
    return this.modal.getByRole('button', { name: /Confirm|Yes|OK|Delete/i });
  }

  get cancelButton(): Locator {
    return this.modal.getByRole('button', { name: /Cancel|No/i });
  }

  get message(): Locator {
    return this.modal.locator('p, [class*="message"]');
  }

  async confirm(): Promise<void> {
    await this.confirmButton.click();
  }

  async cancel(): Promise<void> {
    await this.cancelButton.click();
  }

  async getMessage(): Promise<string> {
    return await this.message.textContent() ?? '';
  }
}
