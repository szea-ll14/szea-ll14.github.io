import {toPlainDecimal} from "./to-plain-decimal.js";
import {requestOutput} from "./request-output.js";

// パラメーター
export const paramList = {
  xpos: {init: 0},
  ypos: {init: 0},
  zpos: {init: 0},
  xrot: {init: 0},
  yrot: {init: 0},
  zrot: {init: 0},
  scale: {init: 1},
  xzscale: {init: 1},
  yscale: {init: 1},
  xbasepos: {init: 0},
  ybasepos: {init: 0},
  zbasepos: {init: 0},
};

// コマンド
const command = document.getElementById("command");
// コピー
const commandCopy = document.getElementById("commandCopy");
// 変数全指定トグル
const commandFull = document.getElementById("commandFull");



export function initParam() {
  // FMBEパラメーター
  for (const [paramName, param] of Object.entries(paramList)) {
    // 値
    param.value = param.init;
    // 入力欄
    param.input = document.getElementById(paramName + "Input");
    // スライダー
    param.slider = document.getElementById(paramName + "Slider");
    // リセットボタン
    param.reset = document.getElementById(paramName + "Reset");
  }

  // 値セット
  function set(paramName, value, {skipInput = false, skipSlider = false} = {}) {
    const param = paramList[paramName];

    let valueFixed = Number(value);
    if (value.trim() === "" || !Number.isFinite(valueFixed)) {
      valueFixed = param.init;
    }

    param.value = valueFixed;
    if (!skipInput) {
      param.input.value = valueFixed;
    }
    if (!skipSlider) {
      param.slider.value = valueFixed;
    }
    requestOutput({setCmd: true, render: true});
  }

  // 値変更
  for (const [paramName, param] of Object.entries(paramList)) {
    param.input.addEventListener("input", e => {
      set(paramName, e.target.value, {skipInput: true});
    });
    param.input.addEventListener("change", e => {
      set(paramName, e.target.value);
    });
    param.slider.addEventListener("input", e => {
      set(paramName, e.target.value, {skipSlider: true});
    });
    param.reset.addEventListener("click", () => {
      set(paramName, param.init);
    });
  }

  // コマンドコピー
  let commandCopyTimeoutID;
  commandCopy.addEventListener("click", () => {
    navigator.clipboard.writeText(
      command.textContent
    );
    commandCopy.textContent = "Copied!";
    clearTimeout(commandCopyTimeoutID);
    commandCopyTimeoutID = setTimeout(() => {
      commandCopy.textContent = "Copy";
    }, 1000);
  });

  commandFull.addEventListener("input", () => {
    requestOutput({setCmd: true});
  });
}



// 設定コマンド出力
export function setCommand() {
  let molang = " ";
  for (const [paramName, param] of Object.entries(paramList)) {
    if (
      !commandFull.checked &&
      (param.value === param.init)
    ) continue;
    molang += `v.${paramName}=${toPlainDecimal(param.value)}; `;
  }
  if (molang === " ") molang = "";
  command.textContent = `playanimation @e[tag=fmbe] animation.player.attack.positions _ 0 "${molang}" setValue`;
}
