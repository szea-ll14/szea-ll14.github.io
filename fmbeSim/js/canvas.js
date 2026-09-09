import {errorLog} from "./error.js";
import {requestOutput} from "./request-output.js";

// canvas
export const canvas = document.getElementById("canvas");
// WebGLコンテキスト
export let gl;
// プログラムオブジェクト・変数の位置
export const itemPrgInfo = {}, axisPrgInfo = {};

// カメラ回転・スケール
export let viewPitch = 15, viewYaw = -10, viewScale = 2;



export async function initCanvas() {
  // WebGLコンテキストを取得
  gl = canvas.getContext("webgl2");
  if (!gl) {
    errorLog("ブラウザーがWebGL2に非対応");
    return;
  }



  let hasFailed = false;

  async function createProgram(name) {
    // シェーダーを取得
    const vertRes = await fetch(`./shader/${name}.vert`);
    if (!vertRes.ok) {
      errorLog(`${name}.vert 取得失敗`);
      hasFailed = true;
      return;
    }

    const fragRes = await fetch(`./shader/${name}.frag`);
    if (!fragRes.ok) {
      errorLog(`${name}.frag 取得失敗`);
      hasFailed = true;
      return;
    }

    const vertSource = await vertRes.text();
    const vertShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertShader, vertSource);
    gl.compileShader(vertShader);
    const fragSource = await fragRes.text();
    const fragShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragShader, fragSource);
    gl.compileShader(fragShader);

    if (!gl.getShaderParameter(vertShader, gl.COMPILE_STATUS)) {
      const log = gl.getShaderInfoLog(vertShader);
      errorLog(`${name}.vert コンパイル失敗`, log);
      hasFailed = true;
    }
    if (!gl.getShaderParameter(fragShader, gl.COMPILE_STATUS)) {
      const log = gl.getShaderInfoLog(fragShader);
      errorLog(`${name}.frag コンパイル失敗`, log);
      hasFailed = true;
    }
    if (hasFailed) {
      gl.deleteShader(vertShader);
      gl.deleteShader(fragShader);
      return;
    }

    // プログラムオブジェクトを作成
    const prg = gl.createProgram();

    // シェーダーをリンク
    gl.attachShader(prg, vertShader);
    gl.deleteShader(vertShader);
    gl.attachShader(prg, fragShader);
    gl.deleteShader(fragShader);
    gl.linkProgram(prg);

    if (!gl.getProgramParameter(prg, gl.LINK_STATUS)) {
      const log = gl.getProgramInfoLog(prg);
      gl.deleteProgram(prg);
      errorLog(`${name}プログラム リンク失敗`, log);
      hasFailed = true;
      return prg;
    }

    return prg;
  }

  // プログラムオブジェクトを作成
  itemPrgInfo.prg = await createProgram("item");
  axisPrgInfo.prg = await createProgram("axis");

  if (hasFailed) {
    if (itemPrgInfo.prg) gl.deleteProgram(itemPrgInfo.prg);
    if (axisPrgInfo.prg) gl.deleteProgram(axisPrgInfo.prg);
    gl = null;
    return;
  }



  // シェーダー内の変数の場所を取得
  itemPrgInfo.position = gl.getAttribLocation(itemPrgInfo.prg, "position");
  itemPrgInfo.uv = gl.getAttribLocation(itemPrgInfo.prg, "uv");
  itemPrgInfo.normal = gl.getAttribLocation(itemPrgInfo.prg, "normal");
  itemPrgInfo.mvpMat = gl.getUniformLocation(itemPrgInfo.prg, "mvpMat");
  itemPrgInfo.mAdjMat = gl.getUniformLocation(itemPrgInfo.prg, "mAdjMat");
  itemPrgInfo.tex = gl.getUniformLocation(itemPrgInfo.prg, "tex");

  axisPrgInfo.position = gl.getAttribLocation(axisPrgInfo.prg, "position");
  axisPrgInfo.color = gl.getAttribLocation(axisPrgInfo.prg, "color");
  axisPrgInfo.mvpMat = gl.getUniformLocation(axisPrgInfo.prg, "mvpMat");



  // カリング・深度テストを有効化
  gl.enable(gl.CULL_FACE);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);

  // canvas初期化設定
  gl.clearColor(.1, .1, .1, 1);
  gl.clearDepth(1);



  // ウィンドウサイズ変更時
  (new ResizeObserver(() => {
    requestOutput({resize: true, render: true});
  })).observe(canvas);



  // カメラ回転・スケール
  const pointerList = {};
  function pointerDown(e) { // ポインターを登録
    pointerList[e.pointerId] = {
      x: e.offsetX, preX: e.offsetX,
      y: e.offsetY, preY: e.offsetY,
      buttons: e.buttons, preButtons: e.buttons,
    };
    canvas.setPointerCapture(e.pointerId);
  }

  function pointerMove(e) { // ポインター動くと
    if (!pointerList.hasOwnProperty(e.pointerId)) return;

    let pointer = pointerList[e.pointerId];
    pointer.x = e.offsetX;
    pointer.y = e.offsetY;
    pointer.buttons = e.buttons;

    const enableList = Object.values(pointerList).filter(p => p.buttons & p.preButtons & 1);

    if (enableList.includes(pointer)) {
      switch (enableList.length) {
        case 1: { // 1本指はカメラ回転
          viewYaw += pointer.x - pointer.preX;
          viewPitch += pointer.y - pointer.preY;
          viewYaw = (viewYaw + 360) % 360;
          viewPitch = Math.min(Math.max(viewPitch, -90), 90);
          requestOutput({render: true});
          break;
        }
        case 2: { // 2本指はスケール
          let preDist = ((enableList[0].preX - enableList[1].preX) ** 2 + (enableList[0].preY - enableList[1].preY) ** 2) ** .5;
          let dist = ((enableList[0].x - enableList[1].x) ** 2 + (enableList[0].y - enableList[1].y) ** 2) ** .5;
          viewScale += (dist - preDist) / 128;
          requestOutput({render: true});
          break;
        }
      }
    }

    pointer.preX = pointer.x;
    pointer.preY = pointer.y;
    pointer.preButtons = pointer.buttons;
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
  canvas.addEventListener("wheel", wheel, {passive: false}); // ホイール回したとき
}
