import type IForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const ForkTsCheckerWebpackPlugin: typeof IForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
  const CopyWebpackPlugin = require('copy-webpack-plugin');


export const plugins = [
  new ForkTsCheckerWebpackPlugin({
    logger: 'webpack-infrastructure',
  }),

  new CopyWebpackPlugin({
      patterns: [
        {
          from: 'node_modules/@doctormckay/steam-crypto/system.pem',
          to: 'system.pem' // This will copy the file to .webpack/main/system.pem
        }
      ]
    })
];
