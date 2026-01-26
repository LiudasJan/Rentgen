import {Locator} from '@playwright/test';
import {BasePage} from './base.page';

export class SidebarPage extends BasePage {

    get newFolderButton(): Locator {
        return this.page.getByTitle('New Folder');
    }

    get allFolders(): Locator {
        // Folders are rendered as buttons - match buttons that have a number (request count) in their name
        // This matches patterns like "New Folder 0", "e2e-tests 1", "All Requests 2"
        return this.page.getByRole('button', {name: /\d+$/});
    }

    /**
     * Get folder header row by name match.
     * Folders are rendered as buttons with the folder name in the accessible name.
     */
    getFolderHeader(name: string): Locator {
        // Search the whole page, not just container, to ensure we find the folder
        return this.page.getByRole('button', {name: new RegExp(name)});
    }

    /**
     * Get folder by index
     */
    getFolderByIndex(index: number): Locator {
        return this.allFolders.nth(index);
    }

    /**
     * Get current folder count
     */
    async getFolderCount(): Promise<number> {
        return await this.allFolders.count();
    }

    /**
     * Create a new folder and wait for it to appear
     */
    async createFolder(): Promise<void> {
        const initialCount = await this.getFolderCount();
        await this.newFolderButton.click();
        await this.waitForCountChange(this.allFolders, initialCount);
    }

    /**
     * Select a folder by its index
     */
    async selectFolderByIndex(index: number): Promise<void> {
        const folder = this.getFolderByIndex(index);
        await folder.waitFor({state: 'visible'});
        await folder.click();
    }

    /**
     * Rename a folder by its index
     * Folder structure: [expand icon, folder icon, edit icon, delete icon, arrow (if has requests)]
     */
    async renameFolderByIndex(index: number, newName: string): Promise<void> {
        const folder = this.getFolderByIndex(index);
        await folder.waitFor({state: 'visible'});

        // Hover to reveal action icons
        await folder.hover();

        // Click on the right side of the folder where edit icon is located
        // The folder button contains: [expand, folder-icon, name, count, edit-icon, delete-icon]
        // Edit icon is approximately 50px from the right edge
        const box = await folder.boundingBox();
        if (box) {
            // Click near the right side where edit icon should be (edit is before delete)
            await this.page.mouse.click(box.x + box.width - 45, box.y + box.height / 2);
        }

        // Fill in the new name - wait for any input to appear
        const input = this.page.locator('input').first();
        await input.waitFor({state: 'visible', timeout: 3000});
        await input.clear();
        await input.fill(newName);
        await this.page.keyboard.press('Enter');

        // Wait for the new name to appear
        await this.page.getByText(newName).first().waitFor({state: 'visible'});
    }

    /**
     * Delete a folder by its index
     * Handles confirmation modal if folder has requests
     * Folder structure: [expand icon, folder icon, edit icon, delete icon, arrow (if has requests)]
     */
    async deleteFolderByIndex(index: number): Promise<void> {
        const folder = this.getFolderByIndex(index);
        const isVisible = await folder.isVisible().catch(() => false);
        if (!isVisible) return;

        // Hover to reveal action icons
        await folder.hover();

        // Click on the right side of the folder where delete icon is located
        // Delete icon is at the far right edge
        const box = await folder.boundingBox();
        if (box) {
            // Click near the right edge where delete icon should be
            await this.page.mouse.click(box.x + box.width - 15, box.y + box.height / 2);
        }

        // Handle confirmation modal if it appears (for non-empty folders)
        const confirmButton = this.page.getByRole('button', {name: /Confirm|Delete|Yes/i});
        await confirmButton.click({timeout: 1000}).catch(() => {
            // No modal appeared - empty folder was deleted directly
        });
    }

    /**
     * Click the delete icon for a folder by name (hover first to reveal).
     * Folder structure: [expand icon, folder icon, edit icon, delete icon, arrow (if has requests)]
     */
    async clickFolderDeleteIcon(name: string): Promise<void> {
        const folderHeader = this.getFolderHeader(name).first();
        await folderHeader.hover();

        // Click on the right side of the folder where delete icon is located
        const box = await folderHeader.boundingBox();
        if (box) {
            // Click near the right edge where delete icon should be
            await this.page.mouse.click(box.x + box.width - 15, box.y + box.height / 2);
        }
    }

    /**
     * Check if a folder with the given name exists.
     */
    async folderExists(name: string): Promise<boolean> {
        // Search for a button that contains the folder name (folders show as "name count")
        const folder = this.page.getByRole('button', {name: new RegExp(name)});
        return (await folder.count()) > 0;
    }

    /**
     * Delete a folder if it exists. Handles confirmation modal for non-empty folders.
     * This is a best-effort cleanup - failures are silently ignored.
     */
    async deleteFolderIfExists(name: string): Promise<void> {
        try {
            if (!(await this.folderExists(name))) {
                return;
            }
            await this.clickFolderDeleteIcon(name);

            // Check if confirmation modal appeared (for non-empty folders)
            const confirmButton = this.page.getByRole('button', {name: /Confirm|Delete|Yes/i});
            if ((await confirmButton.count()) > 0) {
                await confirmButton.first().click();
            }

            // Brief wait for folder to be removed (best effort)
            await this.page.waitForTimeout(500);
        } catch {
            // Best effort cleanup - ignore failures
        }
    }

    /**
     * Create a folder with a specific name
     */
    async createFolderWithName(name: string): Promise<void> {
        await this.createFolder();
        await this.renameFolderByIndex(0, name);
    }


}
