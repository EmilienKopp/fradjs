import fs from 'fs';
import { ConfigManager } from './configManager.js';
import { Cmd } from './commands.js';

export class TsHandler {
  private static packageManager: string;

  static {
    TsHandler.packageManager = ConfigManager.readConfig('packageManager');
  }

  static checkTypescriptInstallation() {
    console.log('Checking TypeScript installation...');
    const output = Cmd.output('npx tsc -v');
    if (output?.includes('Version')) {
      console.log('TypeScript is installed.');
    } else {
      console.log('TypeScript is not installed.');
      TsHandler.installTypescriptDeps();
      if (!fs.existsSync('tsconfig.json')) {
        TsHandler.createTsConfig();
      }
    }
  }

  static ensureTsConfig() {
    if (!fs.existsSync('tsconfig.json')) {
      TsHandler.createTsConfig();
    }
  }

  static installTypescriptDeps() {
    console.log('Installing TypeScript dependencies...');
    Cmd.output('npm install --save-dev typescript @types/node');
  }

  static createTsConfig() {
    console.log('Running `npx tsc --init` to create a tsconfig.json file.');
    Cmd.output('npx tsc --init');
  }
}
