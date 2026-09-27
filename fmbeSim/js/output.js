const needsList = new Set();
const funcList = {};
let requestId = null;

export function registerOutput(name, func) {
  funcList[name] = func;
}

function output() {
  for (const needs of needsList) {
    funcList[needs]();
  }
  needsList.clear();
}

export function requestOutput(...names) {
  for (const n of names) {
    needsList.add(n);
  }
  if (!requestId) {
    requestId = requestAnimationFrame(output);
  }
}
