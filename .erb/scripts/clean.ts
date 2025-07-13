import {rimraf} from 'rimraf';
import webpackPaths from '../configs/webpack.paths.ts';
import process from 'process';

    const args = process.argv.slice(2);
    const commandMap = {
      dist: webpackPaths.distPath,
      release: webpackPaths.releasePath,
      dll: webpackPaths.dllPath,
    };

    args.forEach((x) => {
      const pathToRemove = commandMap[x];
      if (pathToRemove !== undefined) {
        try {
          console.log(`Cleaning: ${pathToRemove}`);
          rimraf.sync(pathToRemove);
          console.log(`Cleaned: ${pathToRemove}`);
        } catch (error) {
          console.error(`Error cleaning ${pathToRemove}:`, error);
          process.exit(1); // Exit with an error code if cleaning fails
        }
      } else {
        console.warn(`Unknown command for cleaning: ${x}. Skipping.`);
      }
    });
