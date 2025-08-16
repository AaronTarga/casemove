import type { ModuleOptions } from 'webpack';

export const rules: Required<ModuleOptions>['rules'] = [
  {
    test: /\.tsx?$/,
    exclude: /(node_modules|\.webpack)/,
    use: {
      loader: 'babel-loader',
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
