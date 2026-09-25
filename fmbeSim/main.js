import {initSettings} from "./js/settings.js";
import {initCmdbox} from "./js/cmdbox.js";
import {initParam} from "./js/param.js";
import {initSplitLayout} from "./js/split-layout.js";
import {initCanvas} from "./js/canvas.js";
import {initItem} from "./js/item.js";
import {initLine} from "./js/line.js";
import {requestOutput} from "./js/request-output.js";

initSettings();
initCmdbox();
initParam();
initSplitLayout();
await initCanvas();
initItem();
initLine();

requestOutput({setvarCmd: true, resize: true, render: true});
