import {requestOutput} from "./request-output.js";

// appBody
const appBody = document.getElementById("appBody");
// canvas
const canvas = document.getElementById("canvas");
// WebGLコンテキスト
let gl;
// プログラムオブジェクト
let prg;

// カメラ回転・スケール
let viewPitch = 15, viewYaw = -10, viewScale = 2;
// canvasアスペクト比
let aspect = 1;



export function getCanvasVar() {
  return {gl, prg, viewPitch, viewYaw, viewScale, aspect};
}



export function resize() {
  if (appBody.clientWidth > appBody.clientHeight) {
    appBody.classList.add("horizontal");
  } else {
    appBody.classList.remove("horizontal");
  }
  canvas.width = canvas.clientWidth * window.devicePixelRatio;
  canvas.height = canvas.clientHeight * window.devicePixelRatio;
  aspect = canvas.clientHeight / canvas.clientWidth;
  gl.viewport(0, 0, canvas.width, canvas.height);
}



export async function initCanvas() {
  // WebGLコンテキストを取得
  gl = canvas.getContext("webgl2");
  if (!gl) {
    console.error("ブラウザーがWebGL2に非対応！");
  }

  // シェーダーを取得
  const vertSource = await (await fetch("./shader/vert.glsl")).text();
  const fragSource = await (await fetch("./shader/frag.glsl")).text();

  // シェーダーをコンパイル
  const vertShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertShader, vertSource);
  gl.compileShader(vertShader);

  const fragShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragShader, fragSource);
  gl.compileShader(fragShader);

  if (!gl.getShaderParameter(vertShader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(vertShader);
    gl.deleteShader(vertShader);
    gl.deleteShader(fragShader);
    console.error(`頂点シェーダーのコンパイルに失敗！\n${log}`);
    gl = null;
    return;
  }
  if (!gl.getShaderParameter(fragShader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(fragShader);
    gl.deleteShader(vertShader);
    gl.deleteShader(fragShader);
    console.error(`フラグメントシェーダーのコンパイルに失敗！\n${log}`);
    gl = null;
    return;
  }

  // プログラムオブジェクトを作成
  prg = gl.createProgram();

  // シェーダーをリンク
  gl.attachShader(prg, vertShader);
  gl.deleteShader(vertShader);
  gl.attachShader(prg, fragShader);
  gl.deleteShader(fragShader);
  gl.linkProgram(prg);
  if (!gl.getProgramParameter(prg, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(prg);
    gl.deleteProgram(prg);
    console.error(`プログラムのリンクに失敗！\n${log}`);
    gl = null;
    return;
  }

  // プログラムオブジェクトを有効化
  gl.useProgram(prg);

  // カリング・深度テストを有効化
  gl.enable(gl.CULL_FACE);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);

  // canvas初期化設定
  gl.clearColor(.1, .1, .1, 1);
  gl.clearDepth(1);



  // ウィンドウサイズ変更時
  window.addEventListener("resize", () => {
    requestOutput({resize: true, render: true});
  });



  // カメラ回転・スケール
  let pointerList = {};
  function pointerDown(e) { // ポインターを登録
    if (e.button === 0) {
      pointerList[e.pointerId] = {
        x: e.offsetX, preX: e.offsetX,
        y: e.offsetY, preY: e.offsetY,
      };
    }
  }

  function pointerMove(e) { // ポインター動くと
    if (!pointerList.hasOwnProperty(e.pointerId)) return;
    let pointer = pointerList[e.pointerId];
    pointer.x = e.offsetX;
    pointer.y = e.offsetY;

    switch (Object.keys(pointerList).length) {
      case 1: { // 1本指はカメラ回転
        viewYaw += pointer.x - pointer.preX;
        viewPitch += pointer.y - pointer.preY;
        viewYaw = (viewYaw + 360) % 360;
        viewPitch = Math.min(Math.max(viewPitch, -90), 90);
        requestOutput({render: true});
        break;
      }
      case 2: { // 2本指はスケール
        const posList = Object.values(pointerList);
        let preDist = ((posList[0].preX - posList[1].preX) ** 2 + (posList[0].preY - posList[1].preY) ** 2) ** .5;
        let dist = ((posList[0].x - posList[1].x) ** 2 + (posList[0].y - posList[1].y) ** 2) ** .5;
        viewScale += (dist - preDist) / 128;
        requestOutput({render: true});
        break;
      }
    }
    pointer.preX = pointer.x;
    pointer.preY = pointer.y;
  }

  function pointerUp(e) { // ポインターを削除
    delete pointerList[e.pointerId];
  }

  function wheel(e) { // ホイール回すと
    if (e.cancelable) e.preventDefault();
    viewScale -= e.deltaY / 1024; // スケール
    requestOutput({render: true});
  }

  canvas.addEventListener("pointerdown", pointerDown); // 押したとき
  canvas.addEventListener("pointermove", pointerMove); // ドラッグ時
  canvas.addEventListener("pointerup", pointerUp); // 離したとき
  canvas.addEventListener("pointercancel", pointerUp); // 消えたとき
  canvas.addEventListener("pointerleave", pointerUp); // 外へ出たとき
  canvas.addEventListener("wheel", wheel, {passive: false}); // ホイール回したとき
}