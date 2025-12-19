import type { ForgeConfig } from '@electron-forge/shared-types';
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { MakerDMG } from '@electron-forge/maker-dmg';
import { MakerDeb } from '@electron-forge/maker-deb';
import { MakerRpm } from '@electron-forge/maker-rpm';
import { AutoUnpackNativesPlugin } from '@electron-forge/plugin-auto-unpack-natives';
import { WebpackPlugin } from '@electron-forge/plugin-webpack';
import { FusesPlugin } from '@electron-forge/plugin-fuses';
import { FuseV1Options, FuseVersion } from '@electron/fuses';
import path from 'path';

import { mainConfig } from './webpack.main.config';
import { rendererConfig } from './webpack.renderer.config';

const config: ForgeConfig = {
  packagerConfig: {
    asar: true,
    executableName: 'Rentgen',
    icon: './assets/icons/rentgen',

    // --- MACOS ---
    osxSign: {
      'hardened-runtime': true,
      'gatekeeper-assess': false,
      entitlements: path.join(__dirname, 'entitlements.mac.plist'),
      'entitlements-inherit': path.join(__dirname, 'entitlements.mac.plist'),
    } as any,
    // macOS notarization
    osxNotarize: {
      tool: 'notarytool',
      appleId: process.env.APPLE_ID,
      appleIdPassword: process.env.APPLE_APP_SPECIFIC_PASSWORD,
      teamId: process.env.APPLE_TEAM_ID,
    } as any,
    // --- MACOS ---
  },
  rebuildConfig: {},
  makers: [
    new MakerSquirrel({
      setupIcon: './assets/icons/rentgen.ico',
      iconUrl: `file://${__dirname}/assets/icons/rentgen.ico`,
    }),
    new MakerDMG({
      icon: './assets/icons/rentgen.icns',
      format: 'ULFO', // Geresnis suspaudimas
    }),
    new MakerRpm({
      options: {
        bin: 'Rentgen',
        icon: './assets/icons/rentgen.png',
      },
    }),
    new MakerDeb({
      options: {
        bin: 'Rentgen',
        icon: './assets/icons/rentgen.png',
      },
    }),
  ],
  plugins: [
    new AutoUnpackNativesPlugin({}),
    new WebpackPlugin({
      mainConfig,
      port: 41205,
      loggerPort: 41206,
      renderer: {
        config: rendererConfig,
        entryPoints: [
          {
            html: './public/index.html',
            js: './src/renderer.ts',
            name: 'main_window',
            preload: {
              js: './electron/preload.ts',
            },
          },
        ],
      },
    }),
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};

export default config;
