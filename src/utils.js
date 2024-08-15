import chalk from 'chalk';

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
const logColors = {
  info: 'blue',
  success: 'green',
  warning: 'yellow',
  error: 'red'
};

/**
* 
* @param {string} message The message to log
* @param {LogType} type The type of log message (info, success, warning, error)
*/
export function log(message, type = 'info') {
  const color = chalk[logColors[type]];
  console.log(color(message));
 }

