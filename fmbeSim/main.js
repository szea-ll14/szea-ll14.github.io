import {initCmd} from "./js/cmd.js";
import {initParam} from "./js/param.js";
import {initSplitLayout} from "./js/split-layout.js";
import {initCanvas} from "./js/canvas.js";
import {initItem} from "./js/item.js";
import {requestOutput} from "./js/request-output.js";

initCmd();
initParam();
initSplitLayout();
await initCanvas();
initItem();
requestOutput({inputCmd: true, resize: true, render: true});
