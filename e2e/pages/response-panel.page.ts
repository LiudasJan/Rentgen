import { Locator } from 'playwright';
import { BasePage } from './base.page';

export class ResponsePanelPage extends BasePage {
  get statusBadge(): Locator {
    // Status badge is the text content containing status code like "200 OK"
    // Extended to handle all common HTTP status codes
    return this.page.locator('text=/\\d{3}\\s+[A-Za-z\\s]+/').first();
  }

  get headersSection(): Locator {
    return this.page.getByRole('heading', { name: 'Headers', level: 4 });
  }

  async getStatus(): Promise<string> {
    await this.waitForResponse();
    return await this.statusBadge.textContent() ?? '';
  }

  async getStatusCode(): Promise<number> {
    const status = await this.getStatus();
    const match = status.match(/\d{3}/);
    return match ? parseInt(match[0]) : 0;
  }

  async waitForResponse(timeout = 30000): Promise<void> {
    // Wait for status code to appear in the page
    // Extended regex to match any HTTP status code followed by status text
    await this.page.waitForSelector('text=/\\d{3}\\s+[A-Za-z\\s]+/', {
      state: 'visible',
      timeout
    });
  }
}
