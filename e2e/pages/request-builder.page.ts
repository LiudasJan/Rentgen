import {Locator} from 'playwright';
import {BasePage} from './base.page';

export class RequestBuilderPage extends BasePage {
    get methodSelect(): Locator {
        // The method dropdown - find the container that shows GET by default
        return this.page.getByText('GET', {exact: true}).first();
    }

    get urlInput(): Locator {
        return this.page.getByPlaceholder('Enter URL or paste text');
    }

    get headersInput(): Locator {
        return this.page.getByPlaceholder('Header-Key: value');
    }

    get bodyInput(): Locator {
        return this.page.getByPlaceholder(/Enter request body/);
    }

    get sendButton(): Locator {
        return this.page.getByRole('button', {name: 'Send', exact: true});
    }

    get saveButton(): Locator {
        return this.page.getByRole('button', {name: /^Save/});
    }

    get importCurlButton(): Locator {
        return this.page.getByRole('button', {name: 'Import cURL'});
    }

    async setMethod(method: string): Promise<void> {
        // Click on the method selector (react-select dropdown) with force to bypass pointer interception
        await this.methodSelect.click({ force: true });
        // Wait for dropdown menu to appear
        const option = this.page.getByText(method, { exact: true }).last();
        await option.waitFor({ state: 'visible' });
        await option.click();
    }

    async setUrl(url: string): Promise<void> {
        await this.urlInput.fill(url);
    }

    async setHeaders(headers: string): Promise<void> {
        await this.headersInput.fill(headers);
    }

    async setBody(body: string): Promise<void> {
        await this.bodyInput.fill(body);
    }

    async send(): Promise<void> {
        await this.sendButton.click();
    }

    async save(): Promise<void> {
        await this.saveButton.click();
    }

    async importCurl(curlCommand: string): Promise<void> {
        await this.importCurlButton.click();
        await this.page.getByPlaceholder('Enter cURL or paste text').fill(curlCommand);
        await this.page.getByRole('button', {name: 'Import', exact: true}).click();
    }
}
