import {requestOutput} from "./request-output.js";

// 分割レイアウト制御
export function initSplitLayout() {
  const appBody = document.getElementById("appBody");
  const appBar = document.getElementById("appBar");
  const root = document.documentElement;
  const appBarSize = parseFloat(getComputedStyle(root).getPropertyValue("--app-bar-size"));
  const appViewSizeMin = parseFloat(getComputedStyle(root).getPropertyValue("--app-view-size-min"));
  let appBarDragging = false;

  function pointerDown(e) { // ポインターを登録
    appBarDragging = true;
    appBar.setPointerCapture(e.pointerId);
    document.body.classList.add("resizing");
  }

  function pointerMove(e) { // ポインター動くと
    if (!appBarDragging) return;

    const appRect = appBody.getBoundingClientRect();
    const isHorizontal = appBody.classList.contains("horizontal");
    const appBodySize = isHorizontal ? appRect.width : appRect.height;
    const appViewSize = isHorizontal ? e.clientX - appRect.left : e.clientY - appRect.top;
    let appViewRatio = (appViewSize - appViewSizeMin) / (appBodySize - appBarSize - appViewSizeMin * 2);
    appViewRatio = Math.min(Math.max(appViewRatio, 0), 1);
    root.style.setProperty("--app-view-ratio", appViewRatio);
    requestOutput({resize: true, render: true});
  }

  function pointerUp() { // ポインターを削除
    if (!appBarDragging) return;
    appBarDragging = false;
    document.body.classList.remove("resizing");
  }

  appBar.addEventListener("pointerdown", pointerDown); // 押したとき
  appBar.addEventListener("pointermove", pointerMove); // ドラッグ時
  appBar.addEventListener("pointerup", pointerUp); // 離したとき
  appBar.addEventListener("pointercancel", pointerUp); // 消えたとき
}
