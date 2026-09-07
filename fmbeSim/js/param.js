import {toPlainDecimal} from "./to-plain-decimal.js";
import {isNoSpace} from "./settings.js";
import {setCmd} from "./cmd.js";
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

// セレクター
const inputSelector = document.getElementById("input-selector");
// デフォルトを含むか
const inputDefaults = document.getElementById("input-defaults");
// アニコン名
const inputController = document.getElementById("input-controller");



export function initParam() {
  // FMBEパラメーター
  for (const [paramName, param] of Object.entries(paramList)) {
    // 値
    param.value = param.init;
    // 入力欄
    param.field = document.getElementById(paramName + "-field");
    // スライダー
    param.slider = document.getElementById(paramName + "-slider");
    // リセットボタン
    param.reset = document.getElementById(paramName + "-reset");
  }

  // 値セット
  function set(paramName, value, {skipField = false, skipSlider = false} = {}) {
    const param = paramList[paramName];

    let valueFixed = Number(value);
    if ((typeof value === "string" && value.trim() === "") || !Number.isFinite(valueFixed)) {
      valueFixed = param.init;
    }

    param.value = valueFixed;
    if (!skipField) {
      param.field.value = valueFixed;
    }
    if (!skipSlider) {
      param.slider.value = valueFixed;
    }
    requestOutput({inputCmd: true, render: true});
  }

  // 値変更
  for (const [paramName, param] of Object.entries(paramList)) {
    param.field.addEventListener("input", e => {
      set(paramName, e.target.value, {skipField: true});
    });
    param.field.addEventListener("change", e => {
      set(paramName, e.target.value);
    });
    param.slider.addEventListener("input", e => {
      set(paramName, e.target.value, {skipSlider: true});
    });
    param.reset.addEventListener("click", () => {
      set(paramName, param.init);
    });
  }

  // Inputコマンド設定/変更時の反映
  inputSelector.addEventListener("input", () => {
    requestOutput({inputCmd: true});
  });
  inputDefaults.addEventListener("change", () => {
    requestOutput({inputCmd: true});
  });
  inputController.addEventListener("input", () => {
    requestOutput({inputCmd: true});
  });
}



// Inputコマンド出力
export function generateInputCmd() {
  let molang = " ";
  for (const [paramName, param] of Object.entries(paramList)) {
    if (
      !inputDefaults.checked &&
      (param.value === param.init)
    ) continue;
    molang += `v.${paramName} = ${toPlainDecimal(param.value)}; `;
  }
  if (molang === " ") molang = "";
  if (isNoSpace()) molang = molang.replaceAll(" ", "");

  const selector = inputSelector.value;
  const controller = inputController.value;

  setCmd("cmd-input", `playanimation ${selector} animation.player.attack.positions _ 0 "${molang}" ${controller}`);
}
