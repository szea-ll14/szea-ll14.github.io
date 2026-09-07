import {setCommand as runSetCmd} from "./param.js";
import {resize as runResize, render as runRender} from "./render.js";

let requestId = null;
let needsSetCmd = false;
let needsResize = false;
let needsRender = false;

function output() {
  requestId = null;
  if (needsSetCmd) {
    needsSetCmd = false;
    runSetCmd();
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

export function requestOutput({setCmd = false, resize = false, render = false} = {}) {
  if (setCmd) needsSetCmd = true;
  if (resize) needsResize = true;
  if (render) needsRender = true;
  if (!requestId) requestId = requestAnimationFrame(output);
}
