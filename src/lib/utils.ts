import chalk from 'chalk';

type LogType = 'info' | 'success' | 'warning' | 'error';

enum LogEnum {
  info = 'blue',
  success = 'green',
  warning = 'yellow',
  error = 'red',
}

// const logColors = {
//   info: 'blue',
//   success: 'green',
//   warning: 'yellow',
//   error: 'red'
// };

export function log(message: string, type: LogType) {
  const color = chalk[LogEnum[type]];
  console.log(color(message));
}

export function info(message: string) {
  log(message, 'info');
}

export function success(message: string) {
  log(message, 'success');
}

export function warning(message: string) {
  log(message, 'warning');
}

export function error(message: string) {
  log(message, 'error');
}
