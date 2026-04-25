import type { ForgeConfig } from '@electron-forge/shared-types';
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { MakerDMG } from '@electron-forge/maker-dmg';
import { MakerDeb } from '@electron-forge/maker-deb';
import { MakerRpm, type MakerRpmConfig } from '@electron-forge/maker-rpm';
import { AutoUnpackNativesPlugin } from '@electron-forge/plugin-auto-unpack-natives';
import { WebpackPlugin } from '@electron-forge/plugin-webpack';
import { FusesPlugin } from '@electron-forge/plugin-fuses';
import { FuseV1Options, FuseVersion } from '@electron/fuses';
import { execSync } from 'child_process';

import { mainConfig } from './webpack.main.config';
import { rendererConfig } from './webpack.renderer.config';

const cliBinaryPath = process.platform === 'win32' ? './cli-bin/rentgen.exe' : './cli-bin/rentgen';

function buildCliBinaryFor(forgePlatform: string, forgeArch: string) {
  const targetPlatform = forgePlatform === 'darwin' ? 'macos' : forgePlatform === 'win32' ? 'win' : 'linux';
  const env = { ...process.env, TARGET_PLATFORM: targetPlatform, TARGET_ARCH: forgeArch };
  console.log(`[forge] Building CLI binary for ${targetPlatform}-${forgeArch}…`);
  execSync('npm run build:cli', { stdio: 'inherit', env });
  execSync('npm run build:cli:bin', { stdio: 'inherit', env });
}

const config: ForgeConfig = {
  packagerConfig: {
    asar: true,
    executableName: 'Rentgen',
    icon: './assets/icons/rentgen',
    osxSign: {},
    extraResource: [cliBinaryPath],
  },
  rebuildConfig: {},
  hooks: {
    prePackage: async (_forgeConfig, platform, arch) => buildCliBinaryFor(platform, arch),
    // FusesPlugin flips bytes inside the Electron binary, which invalidates its original
    // linker-signed signature. @electron/osx-sign needs a Developer ID (or explicit `identity: '-'`)
    // to re-sign — without it, the bundle ships with a broken signature and the kernel SIGKILLs
    // it at launch. Force ad-hoc deep-sign here for local/dev builds with no identity.
    postPackage: async (forgeConfig, packageResult) => {
      if (packageResult.platform !== 'darwin') return;
      const identity = (forgeConfig.packagerConfig?.osxSign as { identity?: string } | undefined)?.identity;
      if (identity && identity !== '-') return;
      for (const outPath of packageResult.outputPaths) {
        const appPath = `${outPath}/Rentgen.app`;
        console.log(`[forge] Ad-hoc deep-signing ${appPath}…`);
        execSync(`codesign --force --deep --sign - "${appPath}"`, { stdio: 'inherit' });
      }
    },
  },
  makers: [
    new MakerSquirrel({
      setupIcon: './assets/icons/rentgen.ico',
      iconUrl: `file://${__dirname}/assets/icons/rentgen.ico`,
    }),
    new MakerDMG({
      icon: './assets/icons/rentgen.icns',
      format: 'ULFO',
    }),
    new MakerRpm({
      // `scripts` is supported by electron-installer-redhat but not declared in
      // @electron-forge/maker-rpm's Config.d.ts — extend the type to keep the auto-symlink hook.
      options: {
        bin: 'Rentgen',
        icon: './assets/icons/rentgen.png',
        scripts: {
          post: './scripts/linux/postinst.sh',
          preun: './scripts/linux/prerm.sh',
        },
      } as NonNullable<MakerRpmConfig['options']> & {
        scripts?: { pre?: string; post?: string; preun?: string; postun?: string };
      },
    }),
    new MakerDeb({
      options: {
        bin: 'Rentgen',
        icon: './assets/icons/rentgen.png',
        scripts: {
          postinst: './scripts/linux/postinst.sh',
          prerm: './scripts/linux/prerm.sh',
        },
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
