import { test as base, ElectronApplication, Page } from '@playwright/test';
import { _electron as electron } from 'playwright';
import path from 'path';
import fs from 'fs';
import os from 'os';

type ElectronFixtures = {
  electronApp: ElectronApplication;
  page: Page;
  testUserDataPath: string;
};

function createTestUserDataDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'rentgen-e2e-'));
}

function cleanupTestUserDataDir(dirPath: string): void {
  try {
    if (fs.existsSync(dirPath)) {
      fs.rmSync(dirPath, { recursive: true, force: true });
    }
  } catch {
    // Ignore cleanup errors
  }
}

function findElectronApp(): { appPath: string; type: 'asar' | 'webpack' } {
  const projectRoot = path.join(__dirname, '../..');

  // Check for packaged app asar (macOS)
  const asarPath = path.join(
    projectRoot,
    'out/Rentgen-darwin-arm64/Rentgen.app/Contents/Resources/app.asar'
  );
  if (fs.existsSync(asarPath)) {
    return { appPath: asarPath, type: 'asar' };
  }

  // Check for x64 mac build
  const asarPathX64 = path.join(
    projectRoot,
    'out/Rentgen-darwin-x64/Rentgen.app/Contents/Resources/app.asar'
  );
  if (fs.existsSync(asarPathX64)) {
    return { appPath: asarPathX64, type: 'asar' };
  }

  // Fallback to webpack dev bundle
  const webpackMain = path.join(projectRoot, '.webpack/main/index.js');
  if (fs.existsSync(webpackMain)) {
    return { appPath: webpackMain, type: 'webpack' };
  }

  throw new Error(
    'Electron app not found. Run "npm run package" first to build the app, or "npm start" to create webpack bundles.'
  );
}

export const test = base.extend<ElectronFixtures>({
  // eslint-disable-next-line no-empty-pattern
  testUserDataPath: async ({}, use) => {
    const testDataPath = createTestUserDataDir();
    console.log(`Using test userData path: ${testDataPath}`);
    await use(testDataPath);
    cleanupTestUserDataDir(testDataPath);
  },

  electronApp: async ({ testUserDataPath }, use) => {
    const { appPath, type } = findElectronApp();

    console.log(`Launching Electron app (${type}): ${appPath}`);

    // Launch electron with the app path (works for both asar and webpack bundles)
    const electronApp = await electron.launch({
      args: [appPath],
      env: {
        ...process.env,
        NODE_ENV: 'test',
        RENTGEN_USER_DATA_PATH: testUserDataPath,
      },
      timeout: 60000,
    });

    // Wait for the first window to be available
    const window = await electronApp.firstWindow();
    await window.waitForLoadState('domcontentloaded');

    await use(electronApp);

    // Cleanup
    await electronApp.close().catch(() => undefined);
  },

  page: async ({ electronApp }, use) => {
    // Get all windows and find the main app window (not DevTools)
    let page = await electronApp.firstWindow();

    // Wait for potential additional windows to open
    await page.waitForTimeout(100);

    // Get all windows
    const windows = electronApp.windows();

    // Find the main window - it should have the app URL, not devtools
    for (const win of windows) {
      const url = win.url();
      // Main window URL contains webpack or file protocol, not devtools://
      if (!url.includes('devtools://')) {
        page = win;
        break;
      }
    }

    // Close DevTools by evaluating in main process
    try {
      await electronApp.evaluate(async ({ BrowserWindow }) => {
        const windows = BrowserWindow.getAllWindows();
        for (const win of windows) {
          if (win.webContents.isDevToolsOpened()) {
            win.webContents.closeDevTools();
          }
        }
      });
    } catch {
      // Ignore errors closing devtools
    }

    await page.waitForLoadState('domcontentloaded');
    // Give extra time for React to hydrate
    await page.waitForTimeout(100);
    await use(page);
  },
});

export { expect } from '@playwright/test';
