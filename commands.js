import { execSync, spawn } from 'child_process';

import chalk from 'chalk';
import fs from 'fs';
import { join } from 'path';

/**
 * @typedef {Object} Cmd
 * @property {function} execute - Executes a shell command asynchronously.
 * @property {function} cd - Changes the current working directory.
 * @property {function} pwd - Gets the current working directory.
 * @property {function} cp - Copies a file from source to destination.
 * @property {function} mv - Moves a file from source to destination.
 * @property {function} rm - Removes files or directories.
 * @property {function} mkdir - Creates a directory or directories.
 * @property {function} rmdir - Removes a directory or directories.
 * @property {function} touch - Creates an empty file at the specified path.
 * @property {function} pull - Pulls the latest changes from the remote Git repository.
 * @property {function} push - Pushes the committed changes to the remote Git repository.
 * @property {function} commit - Commits changes to the Git repository with the given message.
 * @property {function} add - Adds files to the Git staging area.
 */

class Cmd {
  /**
   * Executes a shell command asynchronously.
   * @param {string} command - The command to execute.
   * @param {string} description - A brief description of the command.
   * @returns {Promise<void>} - Resolves when the command completes successfully.
   */
  static async execute(command, description) {
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
          console.log(chalk.bgGreen(`\n ==> ${description ?? "Process"} completed successfully. ✔  \n`));
          resolve();
        } else {
          console.error(`\n ==> ${description ?? "Process"} failed with exit code ${code}. ✘  \n`);
          reject(new Error(chalk.bgRed(`Command failed with exit code ${code}`)));
        }
      });
    });
  }

  /**
   * Changes the current working directory.
   * @param {...string} paths - The path(s) to change to.
   */
  static cd(...paths) {
    const destination = join(...paths);
    process.chdir(destination);
  }

  /**
   * Gets the current working directory.
   * @returns {string} - The current working directory.
   */
  static pwd() {
    return process.cwd();
  }

  /**
   * Copies a file from source to destination.
   * @param {string} source - The source file path.
   * @param {string} destination - The destination file path.
   */
  static cp(source, destination) {
    if(!fs.existsSync(source)) {
      throw new Error(`Source file or directory does not exist: ${source}`);
    }
    if(fs.existsSync(destination)) {
      throw new Error(`Destination file or directory already exists: ${destination}`);
    }
    if (fs.lstatSync(source).isDirectory()) {
      if(!fs.existsSync(destination)) {
        fs.mkdirSync(destination, { recursive: true });
      }
      fs.readdirSync(source).forEach(file => {
        this.cp(join(source, file), join(destination, file));
      });
    } else{
      fs.copyFileSync(source, destination);
    }
  }

  /**
   * Moves a file from source to destination.
   * @param {string} source - The source file path.
   * @param {string} destination - The destination file path.
   */
  static mv(source, destination) {
    fs.renameSync(source, destination);
  }

  /**
   * Removes files or directories.
   * @param {...string} paths - The paths to remove.
   */
  static rm(...paths) {
    paths.forEach(path => {
      fs.rmSync(path, { recursive: true, force: true });
    });
  }

  static rmrf(path) {
    fs.rmSync(path, { recursive: true, force: true });
  }

  /**
   * Creates a directory or directories.
   * @param {...string} paths - The directory path(s) to create.
   */
  static mkdir(...paths) {
    fs.mkdirSync(join(...paths), { recursive: true });
  }

  /**
   * Creates an empty file at the specified path.
   * @param {...string} paths - The file path(s) to create.
   */
  static touch(...paths) {
    fs.closeSync(fs.openSync(join(...paths), 'w'));
  }

  /**
   * Pulls the latest changes from the remote Git repository.
   */
  static pull() {
    this.execute('git pull', 'Pulling latest changes from remote repository');
  }

  /**
   * Pushes the committed changes to the remote Git repository.
   */
  static push() {
    this.execute('git push', 'Pushing changes to remote repository');
  }

  /**
   * Commits changes to the Git repository with the given message.
   * @param {string} message - The commit message.
   */
  static commit(message) {
    this.execute(`git commit -m "${message}"`, `Committing changes with message: "${message}"`);
  }

  /**
   * Adds files to the Git staging area.
   * @param {...string} filesOrPaths - The files or paths to add.
   */
  static add(...filesOrPaths) {
    const files = filesOrPaths.map(file => {
      return fs.existsSync(file) ? file : join(process.cwd(), file);
    });
    this.execute(`git add ${files.join(' ')}`, 'Adding files to staging area');
  }
}

export default Cmd;
