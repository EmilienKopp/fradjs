import fs from 'fs';

export interface Config {
  useTypescript: boolean;
  packageManager: string;
  savePreviousSelection: boolean;
  previousSelection?: {
    [key: string]: {
      [key: string]: boolean;
    };
  };
}

export type ChoiceSelection = {
  [key: string]: boolean;
};

const defaultConfig: Config = {
  savePreviousSelection: true,
  previousSelection: {},
  useTypescript: false,
  packageManager: 'npm',
};

export class ConfigManager {
  static #path = './frad.conf.json';
  constructor() {}

  static {
    if (!fs.existsSync(ConfigManager.#path)) {
      fs.writeFileSync(
        ConfigManager.#path,
        JSON.stringify(defaultConfig, null, 2)
      );
    }
  }

  static saveSelection(data: Partial<Config>) {
    const config = ConfigManager.readConfig() as Config;
    Object.assign(config, data);
    ConfigManager.writeConfig(config);
  }

  static get savePreviousSelection() {
    return ConfigManager.readConfig('savePreviousSelection');
  }

  static get previousSelection() {
    return ConfigManager.readConfig('previousSelection');
  }

  static readConfig(): Config;
  static readConfig<K extends keyof Config>(key: K): Config[K];
  static readConfig(key?: keyof Config) {
    const config = JSON.parse(
      fs.readFileSync(ConfigManager.#path, 'utf8')
    ) as Config;
    return key ? config[key] : config;
  }

  static writeConfig(data: Partial<Config>) {
    if (!data || Object.keys(data).length === 0) {
      return;
    }
    const config = ConfigManager.readConfig();
    Object.assign(config, data);
    fs.writeFileSync(ConfigManager.#path, JSON.stringify(config, null, 2));
  }

  static get path() {
    return ConfigManager.#path;
  }
}
