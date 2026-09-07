import {requestOutput} from "./request-output.js";

// molangに空白を含むか
const settingNoSpace = document.getElementById("setting-no-space");

export function isNoSpace() {
  return settingNoSpace.checked;
}



export function initSettings() {
  // 設定変更時の反映
  settingNoSpace.addEventListener("change", () => {
    requestOutput({inputCmd: true});
  });
}
