/**
* 
* @param {string} message The message to log
* @param {LogType} type The type of log message (info, success, warning, error)
*/
export function log(message, type = 'info') {
  const color = chalk[logColors[type]];
  console.log(color(message));
 }