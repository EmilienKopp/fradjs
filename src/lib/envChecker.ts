import { ConfigManager } from './configManager.js';
import fs from 'fs';

type ENV_VAR = string;

export class EnvChecker {
  static expectDotEnv(...envVars: ENV_VAR[]) {
    for (const envVar of envVars) {
      if (!process.env[envVar]) {
        throw new Error(
          `Environment variable ${envVar} is required but not set.`
        );
      }
    }
  }

  // Check for yarn.lock or package-lock.json or pnpm-lock.yaml
  static detectPackageManager() {
    const managerLockfiles = {
      'yarn.lock': 'yarn',
      'package-lock.json': 'npm',
      'pnpm-lock.yaml': 'pnpm',
    } as {
      [key: string]: string;
    };

    for (const lockfile in managerLockfiles) {
      if (fs.existsSync(lockfile)) {
        ConfigManager.writeConfig({
          packageManager: managerLockfiles[lockfile],
        });
        return managerLockfiles[lockfile];
      }
    }
  }
}
