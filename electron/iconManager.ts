import { app, nativeImage, nativeTheme } from 'electron';
import path from 'path';

function getThemedIconPath(isDark: boolean): string {
  const filename = isDark ? 'rentgen-dark.png' : 'rentgen-light.png';

  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'icons', filename);
  }

  return path.join(app.getAppPath(), 'assets', 'icons', filename);
}

export function applyDockIcon(): void {
  if (process.platform !== 'darwin') return;

  const iconPath = getThemedIconPath(nativeTheme.shouldUseDarkColors);
  const icon = nativeImage.createFromPath(iconPath);

  if (!icon.isEmpty()) {
    app.dock.setIcon(icon);
  }
}

export function registerThemeIconListener(): void {
  if (process.platform !== 'darwin') return;

  nativeTheme.on('updated', () => {
    applyDockIcon();
  });
}
