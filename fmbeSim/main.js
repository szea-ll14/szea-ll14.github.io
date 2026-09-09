import {initSettings} from "./js/settings.js";
import {initCmd} from "./js/cmd.js";
import {initParam} from "./js/param.js";
import {initSplitLayout} from "./js/split-layout.js";
import {initCanvas} from "./js/canvas.js";
import {initItem} from "./js/item.js";
import {requestOutput} from "./js/request-output.js";

initSettings();
initCmd();
initParam();
initSplitLayout();
await initCanvas();
initItem();
requestOutput({setvarCmd: true, resize: true, render: true});
