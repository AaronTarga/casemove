import type { Configuration } from 'webpack';

import path from 'path';

import { rules } from './webpack.rules';
import { plugins } from './webpack.plugins';

export const mainConfig: Configuration = {
  /**
   * This is the main entry point for your application, it's the first file
   * that runs in the main process.
   */
  entry: './src/main/main.ts',
  // Put your normal webpack config below here
  module: {
    rules,
  },

  
 

  plugins,
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.json'],
    modules: [
      path.resolve(__dirname, 'src'), // Add your 'src' directory as a module resolution base
      'node_modules', // Keep this so it can still find npm packages
    ],
  },
};
