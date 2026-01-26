import { Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class EnvironmentPage extends BasePage {
  get newEnvironmentButton(): Locator {
    return this.page.getByText('New Environment');
  }

  get createButton(): Locator {
    return this.page.getByRole('button', { name: 'Create' });
  }

  get nameInput(): Locator {
    // The environment name input has a specific placeholder
    return this.page.getByPlaceholder('e.g., Production, Staging, Local');
  }

  get variableNameInput(): Locator {
    // Last empty variable_name input (for new variables)
    return this.page.locator('input[placeholder="variable_name"]').last();
  }

  get variableValueInput(): Locator {
    // Last empty value input (for new variables)
    return this.page.locator('input[placeholder="value"]').last();
  }

  /**
   * Get an environment button by its exact name
   */
  getEnvironmentByName(name: string): Locator {
    return this.page.getByRole('button', { name, exact: true });
  }

  /**
   * Check if an environment with the given name exists
   */
  async environmentExists(name: string): Promise<boolean> {
    const env = this.getEnvironmentByName(name);
    return (await env.count()) > 0;
  }

  /**
   * Create a new environment with a name
   * Clicking "New Environment" opens "New Environment" panel (not "Edit Environment")
   */
  async createEnvironment(name: string): Promise<void> {
    await this.newEnvironmentButton.click();

    // Wait for the "New Environment" panel to appear
    const newEnvPanel = this.page.getByRole('heading', { name: 'New Environment' });
    await newEnvPanel.waitFor({ state: 'visible', timeout: 3000 });

    // Fill in the name
    await this.nameInput.waitFor({ state: 'visible' });
    await this.nameInput.clear();
    await this.nameInput.fill(name);

    // Click Create button to save the environment
    await this.createButton.click();

    // Wait for environment to appear in the list with the new name
    await expect(async () => {
      expect(await this.environmentExists(name)).toBe(true);
    }).toPass({ timeout: 3000 });
  }

  /**
   * Add a variable to the environment form
   */
  async addVariable(key: string, value: string): Promise<void> {
    await this.variableNameInput.fill(key);
    await this.variableValueInput.fill(value);
    await this.page.keyboard.press('Tab');
  }

  /**
   * Click on an environment to edit it
   */
  async editEnvironment(name: string): Promise<void> {
    const envButton = this.getEnvironmentByName(name);
    await envButton.click();
    // Wait for edit mode
    await this.page.getByText('Edit Environment').waitFor({ state: 'visible' });
  }

  /**
   * Delete an environment if it exists (best effort)
   * This is a cleanup method - failures are silently ignored
   */
  async deleteEnvironmentIfExists(name: string): Promise<void> {
    try {
      if (!(await this.environmentExists(name))) {
        return;
      }

      const envButton = this.getEnvironmentByName(name);
      await envButton.scrollIntoViewIfNeeded();
      await envButton.hover();
      await this.page.waitForTimeout(100);

      // Try to click the delete icon
      const deleteIcon = envButton.locator('img');
      await deleteIcon.click({ force: true, timeout: 1000 }).catch(() => {
        // Ignore click failures
      });

      // Brief wait for deletion to process
      await this.page.waitForTimeout(300);
    } catch {
      // Best effort cleanup - ignore all failures
    }
  }
}
