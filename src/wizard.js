// @ts-check

import { execSync, spawn } from 'child_process';
import ora, { oraPromise } from 'ora';

import { ConfigManager } from './lib/configManager.js';
import chalk from 'chalk';
import fs from 'fs';
import inquirer from 'inquirer';
import { log } from './utils.js';

export { log } from './utils.js';
export { default as Cmd } from './commands.js';

/**
 * @typedef {Object} StepOptions
 * @property {string} [successText] - The message to display when the step succeeds.
 * @property {string} [failText] - The message to display when the step fails.
 * @property {boolean} [exitOnError] - Whether to exit the process when the step fails.
 * 
 */

/**
 * @typedef {(() => any) | (() => Promise<any>)} Callback
 */

/**
 * @typedef { { name: string, key: string, callback: Callback, checked: boolean, options: StepOptions} } Step
 */

/**
 * The BuildSmith class provides a simple way to create a build wizard with multiple steps.
 * @property {Object} config - The configuration object for the build wizard.
 * @property {Step[]} steps - The list of build steps.
 * @property {string} timestamp - The timestamp for the build wizard.
 */
export class Wizard {
  /**
   * @param {Object} config - The configuration object for the build wizard.
   */
  constructor(config = ConfigManager.readConfig()) {
    this.config = config;
    this.steps = [];
    this.timestamp = this.generateTimestamp();
    console.log(config);
  }

  generateTimestamp() {
    const now = new Date();
    return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
  }

  /**
   * @param {Step} [params] - The parameters for the build step.
   */
  addBuildStep(params) {
    if(!params) {
      throw new Error('You must provide a valid build step');
    }
    const { name, key, callback, checked, options } = params;
    this.steps.push({ name, key, callback, checked, options });
  }

  static getArgs() {
    return process.argv.slice(2);
  }

  async run() {
    let previousSelection = {};
    const scriptFilename = this.getScriptFilename() ?? "default";
    if(this.config.savePreviousSelection && ConfigManager.previousSelection) {
      previousSelection = ConfigManager.previousSelection;
    }

    const choices = this.steps.map((step, index) => ({ 
      name: step.name, 
      value: step.key ?? index, 
      checked: previousSelection?.[scriptFilename]?.[step.key] ?? step.checked ??  false 
    }));

    const {selectedSteps} = await this.prompt([
      {
        type: 'checkbox',
        name: 'selectedSteps',
        message: 'Select build steps:',
        choices
      }
    ]);

    if(this.config.savePreviousSelection) {
      const selection = previousSelection;
      selection[scriptFilename] = Object.values(choices).reduce((acc, choice) => {
        acc[choice.value] = selectedSteps.includes(choice.value);
        return acc;
      }, {});
      ConfigManager.saveSelection(selection);
    }
    
    if(selectedSteps.length > 0) {
      for (const key of selectedSteps) {
        const step = this.steps.find(step => step.key === key);
        if (step && step.callback) {
          // await this.runStep(step.name, step.callback, step.options);
        }
      }
    } else {
      log('Well then, I won\'t do anything ... 😢', 'warning');
    }

    console.log("Goodbye 👋");
  }

  /**
   * 
   * @param {string} name Name of the step
   * @param {Callback} callback The callback function to run (can be async)
   * @param {StepOptions} options The options for the step
   */
  async runStep(name, callback, options = {}) {
    if(!callback) {
      throw new Error('You must provide a valid callback function');
    }
    const result = callback();
    const opts = {
      successText: `${chalk.bgGreen(options.successText || `Step "${name}" completed successfully`)}`,
      failText: `${chalk.bgRed(options.failText || `Step "${name}" failed`)}`,
    }
    if(result instanceof Promise) {
      return oraPromise(result, opts);
    } else {
      return oraPromise(Promise.resolve(result), opts);
    }
  }

  /**
   * @param {Object[]} questions - The list of questions to prompt the user.
   * @returns {Promise<Object>} - The answers provided by the user.
   */
  async prompt(questions) {
    return inquirer.prompt(questions);
  }

  /**
   * 
   * @param {string} command The command to execute
   * @returns void
   */
  execSilent(command) {
    try {
      return execSync(command, { encoding: 'utf8' });
    } catch (error) {
      console.error(`Error executing command: ${command}`);
      console.error(error.message);
      return null;
    }
  }

  get projectRoot() {
    return process.cwd();
  }

  readPackageJson() {
    return JSON.parse(fs.readFileSync('./package.json', 'utf8'));
  }

  writePackageJson(data) {
    fs.writeFileSync('./package.json', JSON.stringify(data, null, 2));
  }

  /**
   * Returns the filename of the currently executed script
   * @returns {string | undefined} The filename of the currently executed script
   */
  getScriptFilename() {
    const platformAgnosticPath = process.argv[1].replace(/\\/g, '/');
    return platformAgnosticPath.split('/').pop();
  }
}