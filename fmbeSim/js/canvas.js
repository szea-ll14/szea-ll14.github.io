import {errorLog} from "./error.js";
import {requestOutput} from "./request-output.js";

// canvas
export const canvas = document.getElementById("canvas");
// WebGLコンテキスト
export let gl;
// プログラムオブジェクト・変数の位置
export const itemPrgInfo = {}, linePrgInfo = {};

// カメラ回転・スケール
export let viewPitch = 15, viewYaw = -10, viewScale = 2;



export async function initCanvas() {
  // シェーダーのソースをまとめて取得
  async function loadSource(...nameList) {
    const textList = await Promise.all(nameList.map(async name => {
      const res = await fetch(`./shader/${name}`);
      if (!res.ok) throw Error(`HTTP ${res.status}`);
      return await res.text();
    }));

    return Object.fromEntries(nameList.map((name, i) => [name, textList[i]]));
  }

  // プログラムオブジェクトを作ってシェーダーをリンク
  function buildProgram(sourceList, name) {
    const vertSource = sourceList[`${name}.vert`];
    const vertShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertShader, vertSource);
    gl.compileShader(vertShader);
    const fragSource = sourceList[`${name}.frag`];
    const fragShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragShader, fragSource);
    gl.compileShader(fragShader);

    if (!gl.getShaderParameter(vertShader, gl.COMPILE_STATUS)) {
      const log = gl.getShaderInfoLog(vertShader);
      throw Error(`${name}.vert コンパイル失敗: ${log}`);
    }
    if (!gl.getShaderParameter(fragShader, gl.COMPILE_STATUS)) {
      const log = gl.getShaderInfoLog(fragShader);
      throw Error(`${name}.frag コンパイル失敗: ${log}`);
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
      throw Error(`${name}プログラム リンク失敗: ${log}`);
    }

    return prg;
  }

  try {
    // WebGLコンテキストを取得
    gl = canvas.getContext("webgl2");
    if (!gl) throw Error("ブラウザーがWebGL2に非対応");

    // シェーダーのソースをまとめて取得
    const sourceList = await loadSource("item.vert", "item.frag", "line.vert", "line.frag");

    // プログラムオブジェクトを作ってシェーダーをリンク
    itemPrgInfo.prg = buildProgram(sourceList, "item");
    linePrgInfo.prg = buildProgram(sourceList, "line");
  } catch (error) {
    errorLog("WebGL2の初期化が失敗しました", error);
    gl = null;
    return;
  }



  // シェーダー内の変数の場所を取得
  function getLocations(prginfo) {
    const prg = prginfo.prg;

    // Attribute 変数
    const numAttribs = gl.getProgramParameter(prg, gl.ACTIVE_ATTRIBUTES);
    for (let i = 0; i < numAttribs; ++i) {
      const {name} = gl.getActiveAttrib(prg, i);
      prginfo[name] = gl.getAttribLocation(prg, name);
    }

    // Uniform 変数
    const numUniforms = gl.getProgramParameter(prg, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < numUniforms; ++i) {
      const {name} = gl.getActiveUniform(prg, i);
      prginfo[name] = gl.getUniformLocation(prg, name);
    }
  }

  getLocations(itemPrgInfo);
  getLocations(linePrgInfo);



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
