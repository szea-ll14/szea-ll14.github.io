import {generateSetvarCmd as runSetvarCmd} from "./param.js";
import {resize as runResize, render as runRender} from "./render.js";

let requestId = null;
let needsSetvarCmd = false;
let needsResize = false;
let needsRender = false;

function output() {
  requestId = null;
  if (needsSetvarCmd) {
    needsSetvarCmd = false;
    runSetvarCmd();
  }
  if (needsResize) {
    needsResize = false;
    runResize();
  }
  if (needsRender) {
    needsRender = false;
    runRender();
  }
}

export function requestOutput({setvarCmd = false, resize = false, render = false} = {}) {
  if (setvarCmd) needsSetvarCmd = true;
  if (resize) needsResize = true;
  if (render) needsRender = true;
  if (!requestId) requestId = requestAnimationFrame(output);
}
