import fs from 'fs';

import srcNodeModulesPath from '../configs/webpack.paths';
import appNodeModulesPath from '../configs/webpack.paths';

if (!fs.existsSync(srcNodeModulesPath.toString()) && fs.existsSync(appNodeModulesPath.toString())) {
  fs.symlinkSync(appNodeModulesPath.toString(), srcNodeModulesPath.toString(), 'junction');
}
