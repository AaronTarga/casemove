import type { ModuleOptions } from 'webpack';

export const rules: Required<ModuleOptions>['rules'] = [
  // Add support for native node modules
  {
    // We're specifying native_modules in the test because the asset relocator loader generates a
    // "fake" .node file which is really a cjs file.
    test: /native_modules[/\\].+\.node$/,
    use: 'node-loader',
  },
    {
    test: /\.tsx?$/,
    use: {
      loader: 'babel-loader',
      options: {
        exclude: /node_modules/,
        presets: [
          '@babel/preset-env',
          '@babel/preset-react', // For JSX
          '@babel/preset-typescript', // For TypeScript syntax
        ],
      }
    }
  },
  {
    test: /[/\\]node_modules[/\\].+\.(m?js|node)$/,
    parser: { amd: false },
    use: {
      loader: '@vercel/webpack-asset-relocator-loader',
      options: {
        outputAssetBase: 'native_modules',
      },
    },
  },
];
