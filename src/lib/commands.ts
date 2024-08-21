import { error, info, success, warning } from './utils.js';
import { execSync, spawn } from 'child_process';
import fs, { PathLike } from 'fs';

import chalk from 'chalk';
import { join } from 'path';

export class Cmd {
  /**
   * Executes a shell command asynchronously.
   * @param command
   * @param description
   * @returns Promise<void> that resolves when the command completes successfully.
   */
  static async execute(command: string, description: string) {
    return new Promise<void>((resolve, reject) => {
      const message = description
        ? `Executing: ${description}`
        : `Executing: ${command}`;
      if (message) {
        info(`\n${message}:`);
      }

      const [cmd, ...args] = command.split(' ');
      const proc = spawn(cmd, args, {
        shell: true,
      });

      proc.stdout.on('data', (data) => {
        process.stdout.write(data.toString());
      });

      proc.stderr.on('data', (data) => {
        process.stderr.write(data.toString());
      });

      proc.on('close', (code) => {
        if (code === 0) {
          success(
            `\n ==> ${description ?? 'Process'} completed successfully. ✔  \n`
          );
          resolve();
        } else {
          error(
            `\n ==> ${description ?? 'Process'} failed with exit code ${code}. ✘  \n`
          );
          reject(new Error(chalk.red(`Command failed with exit code ${code}`)));
        }
      });
    });
  }

  // Execute a command but store its output in a return variable
  static output(command: string): string | null {
    try {
      return execSync(command, {
        encoding: 'utf8',
      });
    } catch (error: any) {
      console.error(`Error executing command: ${command}`);
      console.error(error?.message);
      return null;
    }
  }

  /**
   * Changes the current working directory.
   * @param {...string} paths - The path(s) to change to.
   */
  static cd(...paths: string[]) {
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
  static cp(source: string, destination: string) {
    if (!fs.existsSync(source)) {
      throw new Error(`Source file or directory does not exist: ${source}`);
    }
    if (fs.existsSync(destination)) {
      throw new Error(
        `Destination file or directory already exists: ${destination}`
      );
    }
    if (fs.lstatSync(source).isDirectory()) {
      if (!fs.existsSync(destination)) {
        fs.mkdirSync(destination, {
          recursive: true,
        });
      }
      fs.readdirSync(source).forEach((file) => {
        this.cp(join(source, file), join(destination, file));
      });
    } else {
      fs.copyFileSync(source, destination);
    }
  }

  /**
   * Moves a file from source to destination.
   * @param {string} source - The source file path.
   * @param {string} destination - The destination file path.
   */
  static mv(source: string, destination: string) {
    fs.renameSync(source, destination);
  }

  /**
   * Removes files or directories.
   * @param {...string} paths - The paths to remove.
   */
  static rm(...paths: string[]) {
    paths.forEach((path) => {
      fs.rmSync(path, {
        recursive: true,
        force: true,
      });
    });
  }

  static rmrf(path: string) {
    fs.rmSync(path, {
      recursive: true,
      force: true,
    });
  }

  /**
   * Creates a directory or directories.
   * @param {...string} paths - The directory path(s) to create.
   */
  static mkdir(...paths: string[]) {
    fs.mkdirSync(join(...paths), {
      recursive: true,
    });
  }

  /**
   * Creates an empty file at the specified path.
   * @param {...string} paths - The file path(s) to create.
   */
  static touch(...paths: string[]) {
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
  static commit(message: string) {
    this.execute(
      `git commit -m "${message}"`,
      `Committing changes with message: "${message}"`
    );
  }

  /**
   * Adds files to the Git staging area.
   * @param {...string} filesOrPaths - The files or paths to add.
   */
  static add(...filesOrPaths: string[]) {
    const files = filesOrPaths.map((file) => {
      return fs.existsSync(file) ? file : join(process.cwd(), file);
    });
    this.execute(`git add ${files.join(' ')}`, 'Adding files to staging area');
  }
}
