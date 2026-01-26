import { Page, Locator } from 'playwright';

export class EnvironmentEditorModal {
  constructor(private readonly page: Page) {}

  get modal(): Locator {
    return this.page.getByRole('dialog');
  }

  get nameInput(): Locator {
    return this.modal.getByPlaceholder(/name/i);
  }

  get variableRows(): Locator {
    return this.modal.locator('[class*="variable-row"], [class*="VariableRow"]');
  }

  get addVariableButton(): Locator {
    return this.modal.getByRole('button', { name: /Add/i });
  }

  get saveButton(): Locator {
    return this.modal.getByRole('button', { name: /Save/i });
  }

  get cancelButton(): Locator {
    return this.modal.getByRole('button', { name: /Cancel/i });
  }

  async setName(name: string): Promise<void> {
    await this.nameInput.fill(name);
  }

  async addVariable(key: string, value: string): Promise<void> {
    await this.addVariableButton.click();
    const lastRow = this.variableRows.last();
    await lastRow.locator('input').first().fill(key);
    await lastRow.locator('input').last().fill(value);
  }

  async save(): Promise<void> {
    await this.saveButton.click();
  }

  async cancel(): Promise<void> {
    await this.cancelButton.click();
  }
}
