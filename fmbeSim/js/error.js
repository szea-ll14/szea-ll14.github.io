export function errorLog(message, log) {
  console.error(message + log ? `\nlog: ${log}` : "")
}
