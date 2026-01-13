import type { Configuration } from 'webpack';
import type { Configuration as DevServerConfiguration } from 'webpack-dev-server';

import { rules } from './webpack.rules';
import { plugins } from './webpack.plugins';

rules.push({
  test: /\.css$/,
  use: [{ loader: 'style-loader' }, { loader: 'css-loader' }, { loader: 'postcss-loader' }],
});

// Monaco editor requires TTF fonts
rules.push({
  test: /\.ttf$/,
  type: 'asset/resource',
});

export const rendererConfig: Configuration & { devServer?: DevServerConfiguration } = {
  module: {
    rules,
  },
  plugins,
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css'],
  },
  devServer: {
    client: {
      overlay: {
        errors: true,
        warnings: false,
        // Suppress ResizeObserver errors (caused by Monaco Editor's automaticLayout)
        runtimeErrors: (error: Error) => !error?.message?.includes('ResizeObserver loop'),
      },
    },
  },
};
