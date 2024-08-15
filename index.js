import { execSync, spawn } from 'child_process';

import chalk from 'chalk';
import fs from 'fs';
import inquirer from 'inquirer';
import { log } from './utils';
import ora from 'ora';

/**
 * @typedef {Object} StepOptions
 * @property {string} [succeed] - The message to display when the step succeeds.
 * @property {string} [fail] - The message to display when the step fails.
 * @property {boolean} [exitOnError] - Whether to exit the process when the step fails.
 * 
 */

/**
 * @typedef {(() => any) | (() => Promise<any>)} Callback
 * @returns {any} - The result of the callback.
 */

/**
 * @typedef {'info' | 'success' | 'warning' | 'error'} LogType
 */

/**
 * @typedef {Object} LogEnum
 * @property {string} info - The color for info messages.
 * @property {string} success - The color for success messages.
 * @property {string} warning - The color for warning messages.
 * @property {string} error - The color for error messages.
 */

/**
 * @type {LogEnum}
 */
const logColors = {
  info: 'blue',
  success: 'green',
  warning: 'yellow',
  error: 'red'
};

/**
   * 
   * @param {string} command The command to execute
   * @param {string} description A brief description of the command
   * @returns a Promise that resolves when the command completes successfully
   */
export async function command(command, description) {
  return new Promise((resolve, reject) => {
    if (description) {
      console.log(`\n${description}:`);
    }
    
    const [cmd, ...args] = command.split(' ');
    const proc = spawn(cmd, args, { shell: true });

    proc.stdout.on('data', (data) => {
      process.stdout.write(data.toString());
    });

    proc.stderr.on('data', (data) => {
      process.stderr.write(data.toString());
    });

    proc.on('close', (code) => {
      if (code === 0) {
        console.log(chalk.green(`\n ==> ${description ?? "'"+command+"'"} completed successfully. ✔  \n`));
        resolve();
      } else {
        console.error(chalk.red(`\n ==> ${description ?? "Command '"+command+"'"} failed with exit code ${code}. ✘  \n`) );
        reject(new Error(chalk.red(`Command failed with exit code ${code}`)));
      }
    });
  });
}

export class BuildSmith {
  constructor(config = {}) {
    this.config = config;
    this.steps = [];
    this.timestamp = this.generateTimestamp();
  }

  generateTimestamp() {
    const now = new Date();
    return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
  }

  addBuildStep({name, key, callback, checked, options = {}}) {
    this.steps.push({ name, key, callback, checked, options });
    console.log("Added step: ", name);
    console.log(this.steps);
  }

  async run() {
    const choices = this.steps.map((step, index) => ({ name: step.name, value: step.key ?? index, checked: step.checked ?? false }));
    const {selectedSteps} = await this.prompt([
      {
        type: 'checkbox',
        name: 'selectedSteps',
        message: 'Select build steps:',
        choices
      }
    ]);
    if(selectedSteps.length > 0) {
      for (const key of selectedSteps) {
        const step = this.steps.find(step => step.key === key);
        if (step && step.callback) {
          await this.runStep(step.name, step.callback, step.options);
        }
      }
    } else {
      this.log('Well then, I won\'t do anything ... 😢', 'warning');
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
    const spinner = ora({ text: `${chalk.blueBright(name)}`, spinner: "dots" }).start();
    try {
      const result = callback();
      if (result instanceof Promise) {
        await result;
      }
      spinner.succeed(`${chalk.bgGreen(options.succeed || `Step "${name}" completed successfully`)}`);
    } catch (error) {
      spinner.fail(`${chalk.bgRed(options.fail || `Step "${name}" failed`)}`);
      console.error(error);
      if (options.exitOnError) {
        process.exit(1);
      }
    }
  }

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

  readPackageJson() {
    return JSON.parse(fs.readFileSync('./package.json', 'utf8'));
  }

  writePackageJson(data) {
    fs.writeFileSync('./package.json', JSON.stringify(data, null, 2));
  }
}


export {
  log
}