import * as Matrix from "./js/matrix.js";

// 数値を文字列化: 指数表記ではなく整数・小数で
function num2str(num) {
  // 実数以外は思考放棄
  if (!Number.isFinite(num)) return "";
  // 文字列化
  const strRaw = String(num);
  // 指数表記じゃないならそのまま返す
  if (!strRaw.includes("e")) return String(num)

  // 符号・仮数整数部・仮数小数部・指数に分解
  let [, sgn, manInt, manFrac, exp] = strRaw.match(
    /^(-?)(\d*)\.?(\d*)e([+-]\d+)$/
  );
  exp = Number(exp);

  if (exp > 0) { // e+
    manFrac = manFrac.padEnd(exp, "0");
    manInt = manInt + manFrac.slice(0, exp);
    manFrac = manFrac.slice(exp);
  } else if (exp < 0) { // e-
    manInt = manInt.padStart(1 - exp, "0");
    manFrac = manInt.slice(0 + exp) + manFrac;
    manInt = manInt.slice(0, 0 + exp);
  }

  // 小数点が要れば付けて返す
  return sgn + manInt + (manFrac ? "." + manFrac : "");
}

// 度
const DEG = Math.PI / 180;





// ####     #    #        #    #   #
// #   #   # #   #       # #   ## ##
// ####   #   #  #      #   #  # # #
// #      #####  #      #####  #   #
// #      #   #  #####  #   #  #   #

// FMBE変数データ
let paramList = {
  xpos: {value: 0, init: 0},
  ypos: {value: 0, init: 0},
  zpos: {value: 0, init: 0},
  xrot: {value: 0, init: 0},
  yrot: {value: 0, init: 0},
  zrot: {value: 0, init: 0},
  scale: {value: 1, init: 1},
  xzscale: {value: 1, init: 1},
  yscale: {value: 1, init: 1},
  xbasepos: {value: 0, init: 0},
  ybasepos: {value: 0, init: 0},
  zbasepos: {value: 0, init: 0},
};
for (const [paramName, param] of Object.entries(paramList)) {
  // 入力欄
  param.input = document.getElementById(paramName + "Input");
  // スライダー
  param.slider = document.getElementById(paramName + "Slider");
  // ボタン
  param.reset = document.getElementById(paramName + "Reset");
}

// 値セット
function set(paramName, value, {skipInput = false, skipSlider = false} = {}) {
  const param = paramList[paramName];

  let valueFixed = Number(value);
  if (!Number.isFinite(valueFixed)) {
    valueFixed = param.init;
  }

  param.value = valueFixed;
  if (!skipInput) {
    param.input.value = valueFixed;
  }
  if (!skipSlider) {
    param.slider.value = valueFixed;
  }
  setCommand();
  render();
}
// 値リセット
function reset(paramName) {
  set(paramName, paramList[paramName].init);
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
    reset(paramName);
  });
}





//  ####  #####  #####          ###   #   #  #### 
// #      #        #           #   #  ## ##  #   #
//  ###   #####    #           #      # # #  #   #
//     #  #        #           #   #  #   #  #   #
// ####   #####    #            ###   #   #  #### 

// コマンド
const command = document.getElementById("command");
// コピー
const commandCopy = document.getElementById("commandCopy");
// 変数全指定トグル
const commandFull = document.getElementById("commandFull");

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
// コマンド設定
function setCommand() {
  let molang = " ";
  for (const [paramName, param] of Object.entries(paramList)) {
    if (
      !commandFull.checked &&
      (param.value === param.init)
    ) continue;
    molang += `v.${paramName}=${num2str(param.value)}; `;
  }
  if (molang === " ") molang = "";
  command.textContent = `playanimation @e[tag=fmbe] animation.player.attack.positions _ 0 "${molang}" setValue`;
}
commandFull.addEventListener("input", () => {setCommand()});





//  ###     #    #   #  #   #    #     ####
// #   #   # #   ##  #  #   #   # #   #    
// #      #   #  # # #  #   #  #   #   ### 
// #   #  #####  #  ##   # #   #####      #
//  ###   #   #  #   #    #    #   #  #### 

// WebGLコンテキストを取得
const canvas = document.getElementById("canvas");

// カメラ回転・スケール
let viewPitch = 15, viewYaw = -10, viewScale = 2;
{
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
        render();
        break;
      }
      case 2: { // 2本指はスケール
        const posList = Object.values(pointerList);
        let preDist = ((posList[0].preX - posList[1].preX) ** 2 + (posList[0].preY - posList[1].preY) ** 2) ** .5;
        let dist = ((posList[0].x - posList[1].x) ** 2 + (posList[0].y - posList[1].y) ** 2) ** .5;
        viewScale += (dist - preDist) / 128;
        render();
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
    render();
  }

  canvas.addEventListener("pointerdown", pointerDown); // 押したとき
  canvas.addEventListener("pointermove", pointerMove); // ドラッグ時
  canvas.addEventListener("pointerup", pointerUp); // 離したとき
  canvas.addEventListener("pointercancel", pointerUp); // 消えたとき
  canvas.addEventListener("pointerleave", pointerUp); // 外へ出たとき
  canvas.addEventListener("wheel", wheel, {passive: false}); // ホイール回したとき
}





//  ###   #    
// #      #    
// # ###  #    
// #   #  #    
//  ###   #####

// WebGLコンテキストを取得
const gl = canvas.getContext("webgl2");
if (!gl) {
  throw Error("ブラウザがWebGL2に対応していません");
}

// プログラムオブジェクトを作成
const prg = gl.createProgram();

{
  // シェーダーをコンパイル
  // const vertSource = document.getElementById("vertShader").textContent.trim();
  const vertSource = await (await fetch("./shader/vert.glsl")).text();
  const vertShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertShader, vertSource);
  gl.compileShader(vertShader);
  // const fragSource = document.getElementById("fragShader").textContent.trim();
  const fragSource = await (await fetch("./shader/frag.glsl")).text();
  const fragShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragShader, fragSource);
  gl.compileShader(fragShader);

  if (!gl.getShaderParameter(vertShader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(vertShader);
    gl.deleteShader(vertShader);
    gl.deleteShader(fragShader);
    gl.deleteProgram(prg);
    throw Error(`頂点シェーダーのコンパイルに失敗しました：${log}`);
  }
  if (!gl.getShaderParameter(fragShader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(fragShader);
    gl.deleteShader(vertShader);
    gl.deleteShader(fragShader);
    gl.deleteProgram(prg);
    throw Error(`フラグメントシェーダーのコンパイルに失敗しました：${log}`);
  }

  // シェーダーをリンク
  gl.attachShader(prg, vertShader);
  gl.deleteShader(vertShader);
  gl.attachShader(prg, fragShader);
  gl.deleteShader(fragShader);
  gl.linkProgram(prg);
  if (!gl.getProgramParameter(prg, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(prg);
    gl.deleteProgram(prg);
    throw Error(`プログラムのリンクに失敗しました：${log}`);
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
}









// #        #    #   #   ###   #   #  #####
// #       # #    # #   #   #  #   #    #  
// #      #   #    #    #   #  #   #    #  
// #      #####    #    #   #  #   #    #  
// #####  #   #    #     ###    ###     #  

// 分割レイアウト制御
const appBody = document.getElementById("appBody");
{
  const appBar = document.getElementById("appBar");
  const root = document.documentElement;
  const appBarSize = parseFloat(getComputedStyle(root).getPropertyValue("--app-bar-size"));
  const appViewSizeMin = parseFloat(getComputedStyle(root).getPropertyValue("--app-view-size-min"));
  let appBarDragging = false;

  // 押下
  appBar.addEventListener("pointerdown", e => {
    appBarDragging = true;
    appBar.setPointerCapture(e.pointerId);
    document.body.classList.add("resizing");
  });

  appBar.addEventListener("pointermove", e => {
    if (!appBarDragging) return;

    const appRect = appBody.getBoundingClientRect();
    const isHorizontal = appBody.classList.contains("horizontal");
    const appBodySize = isHorizontal ? appRect.width : appRect.height;
    let appViewSize = isHorizontal ? e.clientX - appRect.left : e.clientY - appRect.top;
    let appViewRatio = (appViewSize - appViewSizeMin) / (appBodySize - appBarSize - appViewSizeMin * 2);
    appViewRatio = Math.min(Math.max(appViewRatio, 0), 1);
    root.style.setProperty("--app-view-ratio", appViewRatio);
    resize();
    render();
  });

  appBar.addEventListener("pointerup", e => {
    appBarDragging = false;
    appBar.releasePointerCapture(e.pointerId);
    document.body.classList.remove("resizing");
  });
  appBar.addEventListener("pointercancel", e => {
    appBarDragging = false;
    appBar.releasePointerCapture(e.pointerId);
    document.body.classList.remove("resizing");
  });
}

// ウィンドウサイズ変更時
let aspect = 1;
window.addEventListener("resize", () => {
  resize();
  render();
});
function resize() {
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





// #   #   ###   ####   #####  #    
// ## ##  #   #  #   #  #      #    
// # # #  #   #  #   #  #####  #    
// #   #  #   #  #   #  #      #    
// #   #   ###   ####   #####  #####

// 頂点情報：ブロック
const blockVert = new Float32Array([
  // 位置:vec3, 色:vec3, UV:vec2, 法線:vec3
  // 上
  -.5,  .5, -.5,  0, 1, 0,  .25,  0,  0, 1, 0,
  -.5,  .5,  .5,  0, 1, 1,  .25, .5,  0, 1, 0,
   .5,  .5, -.5,  1, 1, 0,   .5,  0,  0, 1, 0,
   .5,  .5,  .5,  1, 1, 1,   .5, .5,  0, 1, 0,
  // 下
  -.5, -.5, -.5,  0, 0, 0,   .5,  0,  0, -1, 0,
   .5, -.5, -.5,  1, 0, 0,  .75,  0,  0, -1, 0,
  -.5, -.5,  .5,  0, 0, 1,   .5, .5,  0, -1, 0,
   .5, -.5,  .5,  1, 0, 1,  .75, .5,  0, -1, 0,
  // 右
  -.5,  .5, -.5,  0, 1, 0,    0, .5,  -1, 0, 0,
  -.5, -.5, -.5,  0, 0, 0,    0,  1,  -1, 0, 0,
  -.5,  .5,  .5,  0, 1, 1,  .25, .5,  -1, 0, 0,
  -.5, -.5,  .5,  0, 0, 1,  .25,  1,  -1, 0, 0,
  // 前
  -.5,  .5,  .5,  0, 1, 1,  .25, .5,  0, 0, 1,
  -.5, -.5,  .5,  0, 0, 1,  .25,  1,  0, 0, 1,
   .5,  .5,  .5,  1, 1, 1,   .5, .5,  0, 0, 1,
   .5, -.5,  .5,  1, 0, 1,   .5,  1,  0, 0, 1,
  // 左
   .5,  .5,  .5,  1, 1, 1,   .5, .5,  1, 0, 0,
   .5, -.5,  .5,  1, 0, 1,   .5,  1,  1, 0, 0,
   .5,  .5, -.5,  1, 1, 0,  .75, .5,  1, 0, 0,
   .5, -.5, -.5,  1, 0, 0,  .75,  1,  1, 0, 0,
  // 後
   .5,  .5, -.5,  1, 1, 0,  .75, .5,  0, 0, -1,
   .5, -.5, -.5,  1, 0, 0,  .75,  1,  0, 0, -1,
  -.5,  .5, -.5,  0, 1, 0,    1, .5,  0, 0, -1,
  -.5, -.5, -.5,  0, 0, 0,    1,  1,  0, 0, -1,
]);
// インデックス：ブロック
const blockIndex = new Int16Array([
   0,  1,  2, // 上
   2,  1,  3, 
   4,  5,  6, // 下
   6,  5,  7, 
   8,  9, 10, // 右
  10,  9, 11, 
  12, 13, 14, // 前
  14, 13, 15, 
  16, 17, 18, // 左
  18, 17, 19, 
  20, 21, 22, // 後
  22, 21, 23,
]);
// 頂点情報：軸
const axisVert = new Float32Array([
  // 位置:vec3, 色:vec3
  // xyz軸
  0, 0, 0,  1, 0, 0,
  5, 0, 0,  1, 0, 0,
  0, 0, 0,  0, 1, 0,
  0, 5, 0,  0, 1, 0,
  0, 0, 0,  0, 0, 1,
  0, 0, 5,  0, 0, 1,
  // xz平面
  -5, 0, -4.5,  .4, .4, .4,
   5, 0, -4.5,  .4, .4, .4,
  -5, 0, -3.5,  .4, .4, .4,
   5, 0, -3.5,  .4, .4, .4,
  -5, 0, -2.5,  .4, .4, .4,
   5, 0, -2.5,  .4, .4, .4,
  -5, 0, -1.5,  .4, .4, .4,
   5, 0, -1.5,  .4, .4, .4,
  -5, 0, -0.5,  .4, .4, .4,
   5, 0, -0.5,  .4, .4, .4,
  -5, 0,  0.5,  .4, .4, .4,
   5, 0,  0.5,  .4, .4, .4,
  -5, 0,  1.5,  .4, .4, .4,
   5, 0,  1.5,  .4, .4, .4,
  -5, 0,  2.5,  .4, .4, .4,
   5, 0,  2.5,  .4, .4, .4,
  -5, 0,  3.5,  .4, .4, .4,
   5, 0,  3.5,  .4, .4, .4,
  -5, 0,  4.5,  .4, .4, .4,
   5, 0,  4.5,  .4, .4, .4,
  -4.5, 0, -5,  .4, .4, .4,
  -4.5, 0,  5,  .4, .4, .4,
  -3.5, 0, -5,  .4, .4, .4,
  -3.5, 0,  5,  .4, .4, .4,
  -2.5, 0, -5,  .4, .4, .4,
  -2.5, 0,  5,  .4, .4, .4,
  -1.5, 0, -5,  .4, .4, .4,
  -1.5, 0,  5,  .4, .4, .4,
  -0.5, 0, -5,  .4, .4, .4,
  -0.5, 0,  5,  .4, .4, .4,
   0.5, 0, -5,  .4, .4, .4,
   0.5, 0,  5,  .4, .4, .4,
   1.5, 0, -5,  .4, .4, .4,
   1.5, 0,  5,  .4, .4, .4,
   2.5, 0, -5,  .4, .4, .4,
   2.5, 0,  5,  .4, .4, .4,
   3.5, 0, -5,  .4, .4, .4,
   3.5, 0,  5,  .4, .4, .4,
   4.5, 0, -5,  .4, .4, .4,
   4.5, 0,  5,  .4, .4, .4,
]);

const blockCount = blockIndex.length;
const axisCount = axisVert.length / 6;

// シェーダー内の変数の場所を取得
const posLoc = gl.getAttribLocation(prg, 'position');
const colorLoc = gl.getAttribLocation(prg, 'color');
const uvLoc = gl.getAttribLocation(prg, 'uv');
const normalLoc = gl.getAttribLocation(prg, 'normal');

// ブロックのVAOを生成
const blockVao = gl.createVertexArray();
{
  gl.bindVertexArray(blockVao);

  // ブロックのVBOを生成
  const vbo = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, blockVert, gl.STATIC_DRAW);
  gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, 11 * Float32Array.BYTES_PER_ELEMENT, 0);
  gl.vertexAttribPointer(colorLoc, 3, gl.FLOAT, false, 11 * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT);
  gl.vertexAttribPointer(uvLoc, 2, gl.FLOAT, false, 11 * Float32Array.BYTES_PER_ELEMENT, 6 * Float32Array.BYTES_PER_ELEMENT);
  gl.vertexAttribPointer(normalLoc, 3, gl.FLOAT, false, 11 * Float32Array.BYTES_PER_ELEMENT, 8 * Float32Array.BYTES_PER_ELEMENT);
  gl.enableVertexAttribArray(posLoc);
  gl.enableVertexAttribArray(colorLoc);
  gl.enableVertexAttribArray(uvLoc);
  gl.enableVertexAttribArray(normalLoc);

  // ブロックのIBOを生成
  const ibo = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, blockIndex, gl.STATIC_DRAW);

  gl.bindVertexArray(null);
}

// 軸のVAOを生成
const axisVao = gl.createVertexArray();
{
  gl.bindVertexArray(axisVao);

  // 軸のVBOを生成
  const vbo = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, axisVert, gl.STATIC_DRAW);
  gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, 6 * Float32Array.BYTES_PER_ELEMENT, 0);
  gl.vertexAttribPointer(colorLoc, 3, gl.FLOAT, false, 6 * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT);
  gl.enableVertexAttribArray(posLoc);
  gl.enableVertexAttribArray(colorLoc);

  gl.bindVertexArray(null);
}






// #####  #####  #   #  #####  #   #  ####   #####
//   #    #       # #     #    #   #  #   #  #    
//   #    #####    #      #    #   #  ####   #####
//   #    #       # #     #    #   #  #  #   #    
//   #    #####  #   #    #     ###   #   #  #####

// ブロックテクスチャ
let itemList = {
  diamond_block: {
    number: 1,
    image: new Image(),
    loaded: false,
  },
  curved_pumpkin: {
    number: 2,
    image: new Image(),
    loaded: false,
  },
  cartography_table: {
    number: 3,
    image: new Image(),
    loaded: false,
  },
  chain_command_block: {
    number: 4,
    image: new Image(),
    loaded: false,
  },
  alex: {
    number: 5,
    image: new Image(),
    loaded: false,
  },
};
let nowItemName = "diamond_block";

// テクスチャを生成
function imgOnloaded(itemName) {
  const item = itemList[itemName];
  gl.activeTexture(gl.TEXTURE0 + item.number);
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, item.image);
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  item.loaded = true;
  if (nowItemName == itemName) {
    render();
  }
}
for (const [itemName, item] of Object.entries(itemList)) {
  // 画像読み込み
  item.image.src = `./img/${itemName}.png`;
  // 完了したらテクスチャを生成
  item.image.addEventListener("load", () => {
    imgOnloaded(itemName, item);
  });
  // 失敗したらログ
  item.image.addEventListener("error", e => {
    console.warn(`画像 ${itemName} の読み込みに失敗しました`);
  });
}
// ブロック選択
const blockTexture = document.getElementById("blockTexture");

// ブロック変更時の処理
blockTexture.addEventListener("change", e => {
  nowItemName = e.target.value;
  render();
});
// 警告消し用テクスチャ
{
  gl.activeTexture(gl.TEXTURE0);
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 255, 255, 255]));
}





// ####   #####  #   #  ####   #####  #### 
// #   #  #      ##  #  #   #  #      #   #
// ####   #####  # # #  #   #  #####  #### 
// #  #   #      #  ##  #   #  #      #  # 
// #   #  #####  #   #  ####   #####  #   #

// シェーダー内の変数の場所を取得
const texLoadedLoc = gl.getUniformLocation(prg, "texLoaded");
const texLoc = gl.getUniformLocation(prg, "tex");
const mvpMatLoc = gl.getUniformLocation(prg, "mvpMat");
const mAdjMatLoc = gl.getUniformLocation(prg, "mAdjMat");

// 描画
function render() {
  // 行列
  // FMBEによる変形
  let mMat = [ // basepos
    1, 0, 0, paramList.xbasepos.value / 16,
    0, 1, 0, paramList.ybasepos.value / 16,
    0, 0, 1, paramList.zbasepos.value / 16,
    0, 0, 0, 1
  ];
  mMat = Matrix.mul([ // scale
    paramList.scale.value * paramList.xzscale.value, 0, 0, 0,
    0, paramList.scale.value * paramList.yscale.value, 0, 0,
    0, 0, paramList.scale.value * paramList.xzscale.value, 0,
    0, 0, 0, 1
  ], mMat);
  mMat = Matrix.mul([ // xrot
    1, 0, 0, 0,
    0, Math.cos(paramList.xrot.value * DEG), -Math.sin(paramList.xrot.value * DEG), 0,
    0, Math.sin(paramList.xrot.value * DEG), Math.cos(paramList.xrot.value * DEG), 0,
    0, 0, 0, 1
  ], mMat);
  mMat = Matrix.mul([ // zrot
    Math.cos(paramList.zrot.value * DEG), Math.sin(paramList.zrot.value * DEG), 0, 0,
    -Math.sin(paramList.zrot.value * DEG), Math.cos(paramList.zrot.value * DEG), 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
  ], mMat);
  mMat = Matrix.mul([ // yrot
    Math.cos(paramList.yrot.value * DEG), 0, -Math.sin(paramList.yrot.value * DEG), 0,
    0, 1, 0, 0,
    Math.sin(paramList.yrot.value * DEG), 0, Math.cos(paramList.yrot.value * DEG), 0,
    0, 0, 0, 1
  ], mMat);
  mMat = Matrix.mul([ // pos
    1, 0, 0, paramList.xpos.value / 16,
    0, 1, 0, paramList.ypos.value / 16 + 0.5,
    0, 0, 1, paramList.zpos.value / 16,
    0, 0, 0, 1
  ], mMat);
  // カメラの角度・透視投影
  let vpMat = [ // viewYaw
    Math.cos(viewYaw * DEG), 0, Math.sin(viewYaw * DEG), 0,
    0, 1, 0, 0,
    -Math.sin(viewYaw * DEG), 0, Math.cos(viewYaw * DEG), 0,
    0, 0, 0, 1
  ];
  vpMat = Matrix.mul([ // viewPitch
    1, 0, 0, 0,
    0, Math.cos(viewPitch * DEG), -Math.sin(viewPitch * DEG), 0,
    0, Math.sin(viewPitch * DEG), Math.cos(viewPitch * DEG), 0,
    0, 0, 0, 1
  ], vpMat);
  vpMat = Matrix.mul([ // perspective
    aspect * 2 ** viewScale, 0, 0, 0,
    0, 2 ** viewScale, 0, 0,
    0, 0, -1, 19,
    0, 0, -1, 20
  ], vpMat);
  // [a*vS  0 0 0 [1 0 0  0 [1 0  0 0 [1 0 0   0
  //     0 vS 0 0  0 1 0  0  0 1  0 0  0 1 0   0
  //     0  0 1 0  0 0 1 -1  0 0  0 1  0 0 1 -20
  //     0  0 0 1] 0 0 0  1] 0 0 -1 0] 0 0 0   1]


  // canvasを初期化
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


  // ブロックのVBO
  gl.bindVertexArray(blockVao);
  // テクスチャがあれば使う
  gl.uniform1i(texLoc, itemList[nowItemName].number * itemList[nowItemName].loaded);
  gl.uniform1i(texLoadedLoc, itemList[nowItemName].loaded);
  // 変形行列
  gl.uniformMatrix4fv(mvpMatLoc, false, Matrix.t(Matrix.mul(vpMat, mMat)));
  gl.uniformMatrix4fv(mAdjMatLoc, false, Matrix.adj(mMat));
  // ブロックを描画
  gl.drawElements(gl.TRIANGLES, blockCount, gl.UNSIGNED_SHORT, 0);


  // 軸のVBO
  gl.bindVertexArray(axisVao);
  // テクスチャはないよ
  gl.uniform1i(texLoadedLoc, 0);
  // 変形行列
  gl.uniformMatrix4fv(mvpMatLoc, false, Matrix.t(vpMat));
  // 軸を描画
  gl.drawArrays(gl.LINES, 0, axisCount);


  // 描画
  gl.flush();
}





setCommand();
resize();
render();