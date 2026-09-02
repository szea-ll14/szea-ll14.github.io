// param
import {initParam} from "./js/param.js";
initParam();

// split-layout
import {initSplitLayout} from "./js/split-layout.js";
initSplitLayout();

// canvas
import {initCanvas} from "./js/canvas.js";
await initCanvas();

// item
import {initItem} from "./js/item.js";
initItem();

// render
import {requestOutput} from "./js/request-output.js";
requestOutput({setCmd: true, resize: true, render: true});
