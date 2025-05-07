// 行列の乗算
function mulMat(matL, matR) {
  let rtn = [];
  for (let i = 0; i < 16; i++) {
    rtn[i] = matL[i - i % 4    ] * matR[i % 4     ]
           + matL[i - i % 4 + 1] * matR[i % 4 +  4]
           + matL[i - i % 4 + 2] * matR[i % 4 +  8]
           + matL[i - i % 4 + 3] * matR[i % 4 + 12];
  }
  return rtn;
}
// 転置行列
function tMat(mat) {
  return [
    mat[0], mat[4], mat[ 8], mat[12],
    mat[1], mat[5], mat[ 9], mat[13],
    mat[2], mat[6], mat[10], mat[14],
    mat[3], mat[7], mat[11], mat[15],
  ];
}
// 余因子行列
function adjMat(mat) {
  return [
    mat[5]*(mat[10]*mat[15] - mat[11]*mat[14]) + mat[6]*(mat[11]*mat[13] - mat[9]*mat[15]) + mat[7]*(mat[9]*mat[14] - mat[10]*mat[13]),
    mat[1]*(mat[11]*mat[14] - mat[10]*mat[15]) + mat[2]*(mat[9]*mat[15] - mat[11]*mat[13]) + mat[3]*(mat[10]*mat[13] - mat[9]*mat[14]),
    mat[1]*(mat[6]*mat[15] - mat[7]*mat[14]) + mat[2]*(mat[7]*mat[13] - mat[5]*mat[15]) + mat[3]*(mat[5]*mat[14] - mat[6]*mat[13]),
    mat[1]*(mat[7]*mat[10] - mat[6]*mat[11]) + mat[2]*(mat[5]*mat[11] - mat[7]*mat[9]) + mat[3]*(mat[6]*mat[9] - mat[5]*mat[10]),
    mat[4]*(mat[11]*mat[14] - mat[10]*mat[15]) + mat[6]*(mat[8]*mat[15] - mat[11]*mat[12]) + mat[7]*(mat[10]*mat[12] - mat[8]*mat[14]),
    mat[0]*(mat[10]*mat[15] - mat[11]*mat[14]) + mat[2]*(mat[11]*mat[12] - mat[8]*mat[15]) + mat[3]*(mat[8]*mat[14] - mat[10]*mat[12]),
    mat[0]*(mat[7]*mat[14] - mat[6]*mat[15]) + mat[2]*(mat[4]*mat[15] - mat[7]*mat[12]) + mat[3]*(mat[6]*mat[12] - mat[4]*mat[14]),
    mat[0]*(mat[6]*mat[11] - mat[7]*mat[10]) + mat[2]*(mat[7]*mat[8] - mat[4]*mat[11]) + mat[3]*(mat[4]*mat[10] - mat[6]*mat[8]),
    mat[4]*(mat[9]*mat[15] - mat[11]*mat[13]) + mat[5]*(mat[11]*mat[12] - mat[8]*mat[15]) + mat[7]*(mat[8]*mat[13] - mat[9]*mat[12]),
    mat[0]*(mat[11]*mat[13] - mat[9]*mat[15]) + mat[1]*(mat[8]*mat[15] - mat[11]*mat[12]) + mat[3]*(mat[9]*mat[12] - mat[8]*mat[13]),
    mat[0]*(mat[5]*mat[15] - mat[7]*mat[13]) + mat[1]*(mat[7]*mat[12] - mat[4]*mat[15]) + mat[3]*(mat[4]*mat[13] - mat[5]*mat[12]),
    mat[0]*(mat[7]*mat[9] - mat[5]*mat[11]) + mat[1]*(mat[4]*mat[11] - mat[7]*mat[8]) + mat[3]*(mat[5]*mat[8] - mat[4]*mat[9]),
    mat[4]*(mat[10]*mat[13] - mat[9]*mat[14])  + mat[5]*(mat[8]*mat[14] - mat[10]*mat[12]) + mat[6]*(mat[9]*mat[12] - mat[8]*mat[13]),
    mat[0]*(mat[9]*mat[14] - mat[10]*mat[13]) + mat[1]*(mat[10]*mat[12] - mat[8]*mat[14]) + mat[2]*(mat[8]*mat[13] - mat[9]*mat[12]),
    mat[0]*(mat[6]*mat[13] - mat[5]*mat[14]) + mat[1]*(mat[4]*mat[14] - mat[6]*mat[12]) + mat[2]*(mat[5]*mat[12] - mat[4]*mat[13]),
    mat[0]*(mat[5]*mat[10] - mat[6]*mat[9]) + mat[1]*(mat[6]*mat[8] - mat[4]*mat[10]) + mat[2]*(mat[4]*mat[9] - mat[5]*mat[8])
  ];
}
// 数値を文字列化: 指数表記ではなく整数・小数で
function num2str(num) {
  // 実数以外は思考放棄
  if (!Number.isFinite(num)) return "";
  // 文字列化
  const strRaw = String(num);
  // 指数表記じゃないならそのまま返す
  if (!strRaw.includes("e")) return String(num)

  // 符号・仮数整数部・仮数小数部・指数に分解
  let [_, sgn, manInt, manFrac, exp] = strRaw.match(
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
// deg2rad
const deg = Math.PI / 180;





// コマンド
const cmd = document.getElementById("cmd");
// コピー
const cmdBtn = document.getElementById("cmdBtn");
// 変数全指定
const cmdFull = document.getElementById("cmdFull");
// FMBE変数データ
let varData = {
  xpos: {name: "xpos", value: 0, init: 0},
  ypos: {name: "ypos", value: 0, init: 0},
  zpos: {name: "zpos", value: 0, init: 0},
  xrot: {name: "xrot", value: 0, init: 0},
  yrot: {name: "yrot", value: 0, init: 0},
  zrot: {name: "zrot", value: 0, init: 0},
  scale: {name: "scale", value: 1, init: 1},
  xzscale: {name: "xzscale", value: 1, init: 1},
  yscale: {name: "yscale", value: 1, init: 1},
  xbasepos: {name: "xbasepos", value: 0, init: 0},
  ybasepos: {name: "ybasepos", value: 0, init: 0},
  zbasepos: {name: "zbasepos", value: 0, init: 0},
};
for (const varDatum of Object.values(varData)) {
  // 入力欄
  varDatum.inputN = document.getElementById(varDatum.name + "N");
  // スライダー
  varDatum.inputR = document.getElementById(varDatum.name + "R");
}





// コマンドコピー
let cmdBtnTimeoutID;
cmdBtn.onclick = () => {
  navigator.clipboard.writeText(
    cmd.textContent
  );
  cmdBtn.textContent = "Copied!";
  clearTimeout(cmdBtnTimeoutID);
  cmdBtnTimeoutID = setTimeout(() => {
    cmdBtn.textContent = "Copy";
  }, 1000);
}
// コマンド設定
setCmd();
function setCmd() {
  let molang = "";
  for (const varDatum of Object.values(varData)) {
    if (
      !cmdFull.checked &&
      (varDatum.value === varDatum.init)
    ) continue;
    molang += `v.${varDatum.name}=${num2str(varDatum.value)}; `;
  }
  cmd.textContent = `/playanimation @e[tag=fmbe] animation.player.attack.positions _ 0 " ${molang}" setValue`;
}
// 値セット
function set(varName, value, {skipN = false, skipR = false} = {}) {
  const varDatum = varData[varName];

  let valueFixed = Number(value);
  if (!Number.isFinite(valueFixed)) {
    valueFixed = varDatum.init;
  }

  varDatum.value = valueFixed;
  if (!skipN) {
    varDatum.inputN.value = valueFixed;
  }
  if (!skipR) {
    varDatum.inputR.value = valueFixed;
  }
  setCmd();
  draw();
}
// 値リセット
function reset(varName) {
  set(varName, varData[varName].init);
}
// 値変更
for (const varDatum of Object.values(varData)) {
  varDatum.inputN.oninput = e => {
    set(e.target.id.slice(0, -1), e.target.value, {skipN: true});
  };
  varDatum.inputN.onchange = e => {
    set(e.target.id.slice(0, -1), e.target.value);
  };
  varDatum.inputR.oninput = e => {
    set(e.target.id.slice(0, -1), e.target.value, {skipR: true});
  };
}





// WebGLコンテキストを取得
const canvas = document.getElementById("canvas");
const gl = canvas.getContext("webgl2");

// シェーダーをコンパイル
const vertSource = document.getElementById("vertShader").textContent.trim();
const vertShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertShader, vertSource);
gl.compileShader(vertShader);
const fragSource = document.getElementById("fragShader").textContent.trim();
const fragShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragShader, fragSource);
gl.compileShader(fragShader);

// プログラムオブジェクトを作成
const prg = gl.createProgram();

// シェーダーをリンク
gl.attachShader(prg, vertShader);
gl.deleteShader(vertShader);
gl.attachShader(prg, fragShader);
gl.deleteShader(fragShader);
gl.linkProgram(prg);

// プログラムオブジェクトを有効化
gl.useProgram(prg);

// カリング・深度テストを有効化
gl.enable(gl.CULL_FACE);
gl.enable(gl.DEPTH_TEST);
gl.depthFunc(gl.LEQUAL);

// canvas初期化設定
gl.clearColor(.1, .1, .1, 1);
gl.clearDepth(1);





// カメラ回転・スケール
let viewPitch = 15, viewYaw = -10, viewScale = 2;
let preOfsX = 0, preOfsY = 0, preDist = 0;
let mouse = false, touch = false;

canvas.onmousedown = e => {// マウス押したとき
  if (e.which != 1) return;
  mouse = true;
  setupViewRot(e.offsetX, e.offsetY);
};
canvas.onmousemove = e => {// ドラッグ時
  if (!mouse) return;
  changeViewRot(e.offsetX, e.offsetY);
  draw();
};
canvas.onmouseup = e => {// マウス離したとき
  if (e.which == 1) mouse = false;
};
canvas.onmouseleave = e => {// カーソル外出たとき
  if (e.which == 1) mouse = false;
};
canvas.onwheel = e => {//ホイール回したとき
  viewScale -= e.deltaY / 1024;
  draw();
};

canvas.ontouchstart = e => {// 画面押したとき
  touch = e.touches.length;
  if (touch == 1) {
    const rect = canvas.getBoundingClientRect();
    setupViewRot(
      e.touches[0].clientX - rect.left,
      e.touches[0].clientY - rect.top
    );
  } else if (touch == 2) {
    setupViewScale(
      e.touches[0].clientX,
      e.touches[0].clientY,
      e.touches[1].clientX,
      e.touches[1].clientY
    );
  }
}
canvas.ontouchmove = e => {// ドラッグ時
  if (e.cancelable) e.preventDefault();
  if (touch == 1) {
    const rect = canvas.getBoundingClientRect();
    changeViewRot(
      e.touches[0].clientX - rect.left,
      e.touches[0].clientY - rect.top
    );
    draw();
  } else if (touch == 2) {
    changeViewScale(
      e.touches[0].clientX,
      e.touches[0].clientY,
      e.touches[1].clientX,
      e.touches[1].clientY
    );
    draw();
  }
}
canvas.ontouchend = canvas.ontouchstart; // 画面離したとき

function setupViewRot(ofsX, ofsY) {
  preOfsX = ofsX;
  preOfsY = ofsY;
}
function changeViewRot(ofsX, ofsY) {
  viewYaw += ofsX - preOfsX;
  viewPitch += ofsY - preOfsY;
  viewYaw %= 360;
  if (viewPitch < -90) viewPitch = -90;
  if (viewPitch > 90) viewPitch = 90;
  preOfsX = ofsX;
  preOfsY = ofsY;
}
function setupViewScale(ofsX0, ofsY0, ofsX1, ofsY1) {
  preDist = ((ofsX0 - ofsX1) ** 2 + (ofsY0 - ofsY1) ** 2) ** .5;
}
function changeViewScale(ofsX0, ofsY0, ofsX1, ofsY1) {
  let dist = ((ofsX0 - ofsX1) ** 2 + (ofsY0 - ofsY1) ** 2) ** .5;
  viewScale += (dist - preDist) / 128;
  preDist = dist;
}

// ウィンドウサイズ変更時
let aspect = 1;
window.onresize = () => {
  canvas.width = canvas.clientWidth;
  aspect = 300 / canvas.clientWidth;
  gl.viewport(0, 0, canvas.clientWidth, 300);
  draw();
};
canvas.width = canvas.clientWidth;
aspect = 300 / canvas.clientWidth;
gl.viewport(0, 0, canvas.clientWidth, 300);





// 頂点情報 : ブロック
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
// インデックス : ブロック
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
// 頂点情報 : 軸
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





// シェーダー内の変数の場所を取得
const posLoc = gl.getAttribLocation(prg, 'position');
const colorLoc = gl.getAttribLocation(prg, 'color');
const uvLoc = gl.getAttribLocation(prg, 'uv');
const normalLoc = gl.getAttribLocation(prg, 'normal');
const texLoadedLoc = gl.getUniformLocation(prg, "texLoaded");
const texLoc = gl.getUniformLocation(prg, "tex");
const mvpMatLoc = gl.getUniformLocation(prg, "mvpMat");
const mAdjMatLoc = gl.getUniformLocation(prg, "mAdjMat");

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





// ブロックテクスチャ
let texLoaded = false;
const img = new Image();
img.src = "./alex.png";
const tex = gl.createTexture();
img.onload = () => {
  texLoaded = true;
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.activeTexture(gl.TEXTURE0);
  gl.uniform1i(texLoc, 0);
  draw();
};





// 描画
draw();
function draw() {
  // 行列
  // FMBEによる変形
  let mMat = [ // basepos
    1, 0, 0, varData.xbasepos.value / 16,
    0, 1, 0, varData.ybasepos.value / 16,
    0, 0, 1, varData.zbasepos.value / 16,
    0, 0, 0, 1
  ];
  mMat = mulMat([ // scale
    varData.scale.value * varData.xzscale.value, 0, 0, 0,
    0, varData.scale.value * varData.yscale.value, 0, 0,
    0, 0, varData.scale.value * varData.xzscale.value, 0,
    0, 0, 0, 1
  ], mMat);
  mMat = mulMat([ // xrot
    1, 0, 0, 0,
    0, Math.cos(varData.xrot.value * deg), -Math.sin(varData.xrot.value * deg), 0,
    0, Math.sin(varData.xrot.value * deg), Math.cos(varData.xrot.value * deg), 0,
    0, 0, 0, 1
  ], mMat);
  mMat = mulMat([ // zrot
    Math.cos(varData.zrot.value * deg), Math.sin(varData.zrot.value * deg), 0, 0,
    -Math.sin(varData.zrot.value * deg), Math.cos(varData.zrot.value * deg), 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
  ], mMat);
  mMat = mulMat([ // yrot
    Math.cos(varData.yrot.value * deg), 0, -Math.sin(varData.yrot.value * deg), 0,
    0, 1, 0, 0,
    Math.sin(varData.yrot.value * deg), 0, Math.cos(varData.yrot.value * deg), 0,
    0, 0, 0, 1
  ], mMat);
  mMat = mulMat([ // pos
    1, 0, 0, varData.xpos.value / 16,
    0, 1, 0, varData.ypos.value / 16 + 0.5,
    0, 0, 1, varData.zpos.value / 16,
    0, 0, 0, 1
  ], mMat);
  // カメラの角度・透視投影
  let vpMat = [ // viewYaw
    Math.cos(viewYaw * deg), 0, Math.sin(viewYaw * deg), 0,
    0, 1, 0, 0,
    -Math.sin(viewYaw * deg), 0, Math.cos(viewYaw * deg), 0,
    0, 0, 0, 1
  ];
  vpMat = mulMat([ // viewPitch
    1, 0, 0, 0,
    0, Math.cos(viewPitch * deg), -Math.sin(viewPitch * deg), 0,
    0, Math.sin(viewPitch * deg), Math.cos(viewPitch * deg), 0,
    0, 0, 0, 1
  ], vpMat);
  vpMat = mulMat([ // perspective
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
  gl.uniform1i(texLoadedLoc, texLoaded);
  // 変形行列
  gl.uniformMatrix4fv(mvpMatLoc, false, tMat(mulMat(vpMat, mMat)));
  gl.uniformMatrix4fv(mAdjMatLoc, false, adjMat(mMat));
  // ブロックを描画
  gl.drawElements(gl.TRIANGLES, blockIndex.length, gl.UNSIGNED_SHORT, 0);





  // 軸のVBO
  gl.bindVertexArray(axisVao);
  // テクスチャはないよ
  gl.uniform1i(texLoadedLoc, 0);
  // 変形行列
  gl.uniformMatrix4fv(mvpMatLoc, false, tMat(vpMat));
  // 軸を描画
  gl.drawArrays(gl.LINES, 0, axisVert.length / 6);





  // 描画
  gl.flush();
}
