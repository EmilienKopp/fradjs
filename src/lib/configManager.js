import fs from 'fs';

const defaultConfig = {
  "savePreviousSelection": true,
  "previousSelection": {},
}

export class ConfigManager {
  static #path = './frad.conf.json';
  constructor() {
  }
  
  static {
    if(!fs.existsSync(ConfigManager.#path)) {
      fs.writeFileSync(ConfigManager.#path, JSON.stringify(defaultConfig, null, 2));
    }
  }

  static saveSelection(data) {
    const config = ConfigManager.readConfig();
    config.previousSelection = data;
    ConfigManager.writeConfig(config);
  }

  static get savePreviousSelection() {
    return ConfigManager.readConfig().savePreviousSelection;
  }

  static get previousSelection() {
    return ConfigManager.readConfig().previousSelection;
  }

  static readConfig() {
    return JSON.parse(fs.readFileSync(ConfigManager.#path, 'utf8'));
  }

  static writeConfig(data) {
    fs.writeFileSync(ConfigManager.#path, JSON.stringify(data, null, 2));
  }
  
  static get path() {
    return ConfigManager.#path;
  }

}