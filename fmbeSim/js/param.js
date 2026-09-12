import {toPlainDecimal} from "./to-plain-decimal.js";
import {isNoSpace} from "./settings.js";
import {setCmd} from "./cmd.js";
import {requestOutput} from "./request-output.js";

// パラメーター
export const paramList = new Map([
  ["xpos", {init: 0, var: true}],
  ["ypos", {init: 0, var: true}],
  ["zpos", {init: 0, var: true}],
  ["xrot", {init: 0, var: true}],
  ["yrot", {init: 0, var: true}],
  ["zrot", {init: 0, var: true}],
  ["scale", {init: 1, var: true}],
  ["xzscale", {init: 1, var: true}],
  ["yscale", {init: 1, var: true}],
  ["xbasepos", {init: 0, var: true}],
  ["ybasepos", {init: 0, var: true}],
  ["zbasepos", {init: 0, var: true}],
]);

// パラメーターグリッド
const paramGrid = document.getElementById("param-grid");

// セレクター
const setvarSelector = document.getElementById("setvar-selector");
// デフォルトを含むか
const setvarDefaults = document.getElementById("setvar-defaults");
// アニコン名
const setvarController = document.getElementById("setvar-controller");



// 値セット
function set(paramName, value, {skipField = false, skipSlider = false} = {}) {
  const param = paramList.get(paramName);

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

  requestOutput({setvarCmd: true, render: true});
}



export function initParam() {
  // FMBEパラメーター
  paramGrid.replaceChildren();
  for (const [paramName, param] of paramList) {
    // 値
    param.value = param.init;
    const [fieldStep, sliderStep, sliderMin, sliderMax]
      = paramName.includes("pos") ? [1, 0.1, -80, 80]
      : paramName.includes("rot") ? [1, 1, -180, 180]
      : paramName.includes("scale") ? [0.1, 0.01, 0, 5]
      : [1, 1, -1, 1];

    // ラベル
    const label = document.createElement("label");
    label.textContent = paramName;
    label.htmlFor = `${paramName}-field`;
    paramGrid.appendChild(label);

    // 入力欄
    param.field = document.createElement("input");
    param.field.id = `${paramName}-field`;
    param.field.type = "number";
    param.field.value = param.init;
    param.field.step = fieldStep;
    param.field.addEventListener("input", e => {
      set(paramName, e.target.value, {skipField: true});
    });
    param.field.addEventListener("change", e => {
      set(paramName, e.target.value);
    });
    paramGrid.appendChild(param.field);

    // スライダー
    param.slider = document.createElement("input");
    param.slider.id = `${paramName}-slider`;
    param.slider.type = "range";
    param.slider.value = param.init;
    param.slider.step = sliderStep;
    param.slider.min = sliderMin;
    param.slider.max = sliderMax;
    param.slider.addEventListener("input", e => {
      set(paramName, e.target.value, {skipSlider: true});
    });
    paramGrid.appendChild(param.slider);

    // リセットボタン
    param.reset = document.createElement("button");
    param.reset.id = `${paramName}-reset`;
    param.reset.type = "button";
    param.reset.textContent = "Reset";
    param.reset.addEventListener("click", () => {
      set(paramName, param.init);
    });
    paramGrid.appendChild(param.reset);
  }

  // 代入コマンド設定/変更時の反映
  setvarSelector.addEventListener("input", () => {
    requestOutput({setvarCmd: true});
  });
  setvarDefaults.addEventListener("change", () => {
    requestOutput({setvarCmd: true});
  });
  setvarController.addEventListener("input", () => {
    requestOutput({setvarCmd: true});
  });
}



// 代入コマンド出力
export function generateSetvarCmd() {
  let molang = " ";
  for (const [paramName, param] of paramList) {
    if (
      !setvarDefaults.checked &&
      (param.value === param.init)
    ) continue;
    molang += `v.${paramName} = ${toPlainDecimal(param.value)}; `;
  }
  if (molang === " ") molang = "";
  if (isNoSpace()) molang = molang.replaceAll(" ", "");

  const selector = setvarSelector.value;
  const controller = setvarController.value;

  setCmd("cmd-setvar", `playanimation ${selector} animation.player.attack.positions _ 0 "${molang}" ${controller}`);
}
