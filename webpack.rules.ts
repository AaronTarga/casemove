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
    test: /[/\\]node_modules[/\\].+\.(m?js|node)$/,
    parser: { amd: false },
    use: {
      loader: '@vercel/webpack-asset-relocator-loader',
      options: {
        outputAssetBase: 'native_modules',
      },
    },
  },
  {
    test: /\.tsx?$/,
    exclude: /(node_modules|\.webpack)/,
    use: {
      loader: 'ts-loader',
      options: {
        exclude: /node_modules/,
        presets: [
          ['@babel/preset-react', {
            runtime: 'automatic' // 👈 This is the key
          }],
          '@babel/preset-env',
          '@babel/preset-typescript', // For TypeScript syntax
        ],
      }
    }
  },
   {
      test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                // Ensure your PostCSS plugins are correctly loaded
                // The plugins can be defined here or in postcss.config.js
                plugins: [
                  require('@tailwindcss/postcss'),
                  require('autoprefixer'),
                ],
            },
            },
          },
        ],
      }
];
