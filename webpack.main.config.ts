import type { Configuration } from 'webpack';

import { rules } from './webpack.rules';
import { plugins } from './webpack.plugins';

import path from 'path';

export const mainConfig: Configuration = {
  /**
   * This is the main entry point for your application, it's the first file
   * that runs in the main process.
   */
  entry: './src/main/main.ts',
  // Put your normal webpack config below here
  node: {
        __dirname: true, // any value not work
  },
  module: {
    rules,
  },

 externals: {
    // Treat 'lzma' as an external dependency
    'lzma': 'commonjs lzma',
    'steam-crypto': 'commonjs steamcrypto'
  },

  plugins,
  resolve: {
    modules: [
      path.resolve(__dirname, 'src'),
      'node_modules'
    ],
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.json'],
  }
};
