import {generateInputCmd as runInputCmd} from "./param.js";
import {resize as runResize, render as runRender} from "./render.js";

let requestId = null;
let needsInputCmd = false;
let needsResize = false;
let needsRender = false;

function output() {
  requestId = null;
  if (needsInputCmd) {
    needsInputCmd = false;
    runInputCmd();
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

export function requestOutput({inputCmd = false, resize = false, render = false} = {}) {
  if (inputCmd) needsInputCmd = true;
  if (resize) needsResize = true;
  if (render) needsRender = true;
  if (!requestId) requestId = requestAnimationFrame(output);
}
