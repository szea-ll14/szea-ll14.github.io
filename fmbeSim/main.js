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

// 行列の転置
function tMat(mat) {
  return [
    mat[0], mat[4], mat[ 8], mat[12],
    mat[1], mat[5], mat[ 9], mat[13],
    mat[2], mat[6], mat[10], mat[14],
    mat[3], mat[7], mat[11], mat[15],
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
    /^(-?)(\d*)(?:\.(\d*))?e([+-]\d+)$/
  );
  if (!manFrac) { // nullらせない
    manFrac = "";
  }
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





// カメラの角度
let viewPitch = 15, viewYaw = -10;

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
function copy() {
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

for (const varDatum of Object.values(varData)) {
  // 変更時処理
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
const gl = canvas.getContext("webgl");

// シェーダーをコンパイル
const vertSource = document.getElementById("vertShader").textContent;
const vertShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertShader, vertSource);
gl.compileShader(vertShader);
const fragSource = document.getElementById("fragShader").textContent;
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





// カメラ回転
let preOfsX = 0, preOfsY = 0;
let mouse = false, touch = false;

canvas.onmousedown = e => {// マウス押したとき
  if (e.which != 1) return;
  mouse = true;
  setupViewRot(e.offsetX, e.offsetY);
};

canvas.onmousemove = e => {// ドラッグ時
  if (!mouse) return;
  viewRot(e.offsetX, e.offsetY);
  draw();
};

canvas.onmouseup = e => {// マウス離したとき
  if (e.which == 1) mouse = false;
};

canvas.onmouseleave = e => {// カーソル外出たとき
  if (e.which == 1) mouse = false;
};

canvas.ontouchstart = e => {// 画面押したとき
  touch = false;
  if (e.touches.length != 1) return;
  touch = true;
  const rect = canvas.getBoundingClientRect();
  setupViewRot(
    e.touches[0].clientX - rect.left,
    e.touches[0].clientY - rect.top
  );
}

canvas.ontouchmove = e => {// ドラッグ時
  if (e.cancelable) e.preventDefault();
  if (!touch) return;
  const rect = canvas.getBoundingClientRect();
  viewRot(
    e.touches[0].clientX - rect.left,
    e.touches[0].clientY - rect.top
  );
  draw();
}

canvas.ontouchend = e => {// 画面離したとき
  touch = false;
}

function setupViewRot(ofsX, ofsY) {
  preOfsX = ofsX;
  preOfsY = ofsY;
}

function viewRot(ofsX, ofsY) {
  viewYaw += ofsX - preOfsX;
  viewPitch += ofsY - preOfsY;
  viewYaw %= 360;
  if (viewPitch < -90) viewPitch = -90;
  if (viewPitch > 90) viewPitch = 90;
  preOfsX = ofsX;
  preOfsY = ofsY;
}





// 頂点情報
// ブロック/位置
const blockPos = [
  -0.5, -0.5, -0.5,
   0.5, -0.5, -0.5,
  -0.5, -0.5,  0.5,
   0.5, -0.5,  0.5,
  -0.5,  0.5, -0.5,
   0.5,  0.5, -0.5,
  -0.5,  0.5,  0.5,
   0.5,  0.5,  0.5,
];

// ブロック/色
const blockColor = [
  0, 0, 0, 1,
  1, 0, 0, 1,
  0, 0, 1, 1,
  1, 0, 1, 1,
  0, 1, 0, 1,
  1, 1, 0, 1,
  0, 1, 1, 1,
  1, 1, 1, 1,
];

// ブロック/テクスチャ座標
const blockUv = [
  // 上
  // 下
  // 右
  // 前
  // 左
  // 後
];

// ブロック/インデックス
const blockIndex = [
  4, 6, 5, // 上
  5, 6, 7, 
  0, 1, 2, // 下
  2, 1, 3, 
  4, 0, 6, // 右
  6, 0, 2, 
  6, 2, 7, // 前
  7, 2, 3, 
  7, 3, 5, // 左
  5, 3, 1, 
  5, 1, 4, // 後
  4, 1, 0,
];

// 軸/位置
const axisPos = [
  0, 0, 0,
  5, 0, 0,
  0, 0, 0,
  0, 5, 0,
  0, 0, 0,
  0, 0, 5,
  -5, 0, -4.5,
   5, 0, -4.5,
  -5, 0, -3.5,
   5, 0, -3.5,
  -5, 0, -2.5,
   5, 0, -2.5,
  -5, 0, -1.5,
   5, 0, -1.5,
  -5, 0, -0.5,
   5, 0, -0.5,
  -5, 0,  0.5,
   5, 0,  0.5,
  -5, 0,  1.5,
   5, 0,  1.5,
  -5, 0,  2.5,
   5, 0,  2.5,
  -5, 0,  3.5,
   5, 0,  3.5,
  -5, 0,  4.5,
   5, 0,  4.5,
  -4.5, 0, -5,
  -4.5, 0,  5,
  -3.5, 0, -5,
  -3.5, 0,  5,
  -2.5, 0, -5,
  -2.5, 0,  5,
  -1.5, 0, -5,
  -1.5, 0,  5,
  -0.5, 0, -5,
  -0.5, 0,  5,
   0.5, 0, -5,
   0.5, 0,  5,
   1.5, 0, -5,
   1.5, 0,  5,
   2.5, 0, -5,
   2.5, 0,  5,
   3.5, 0, -5,
   3.5, 0,  5,
   4.5, 0, -5,
   4.5, 0,  5,
];

// 軸/色
const axisColor = [
  1, 0, 0, 1,
  1, 0, 0, 1,
  0, 1, 0, 1,
  0, 1, 0, 1,
  0, 0, 1, 1,
  0, 0, 1, 1,
  .4, .4, .4, 1,
  .4, .4, .4, 1,
  .4, .4, .4, 1,
  .4, .4, .4, 1,
  .4, .4, .4, 1,
  .4, .4, .4, 1,
  .4, .4, .4, 1,
  .4, .4, .4, 1,
  .4, .4, .4, 1,
  .4, .4, .4, 1,
  .4, .4, .4, 1,
  .4, .4, .4, 1,
  .4, .4, .4, 1,
  .4, .4, .4, 1,
  .4, .4, .4, 1,
  .4, .4, .4, 1,
  .4, .4, .4, 1,
  .4, .4, .4, 1,
  .4, .4, .4, 1,
  .4, .4, .4, 1,
  .4, .4, .4, 1,
  .4, .4, .4, 1,
  .4, .4, .4, 1,
  .4, .4, .4, 1,
  .4, .4, .4, 1,
  .4, .4, .4, 1,
  .4, .4, .4, 1,
  .4, .4, .4, 1,
  .4, .4, .4, 1,
  .4, .4, .4, 1,
  .4, .4, .4, 1,
  .4, .4, .4, 1,
  .4, .4, .4, 1,
  .4, .4, .4, 1,
  .4, .4, .4, 1,
  .4, .4, .4, 1,
  .4, .4, .4, 1,
  .4, .4, .4, 1,
  .4, .4, .4, 1,
  .4, .4, .4, 1,
];





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
    4, 0, 0, 0,
    0, 4, 0, 0,
    0, 0, -1, 19,
    0, 0, -1, 20
  ], vpMat);
  // [4 0 0  0 [1 0  0 0 [1 0 0   0
  //  0 4 0  0  0 1  0 0  0 1 0   0
  //  0 0 1 -1  0 0  0 1  0 0 1 -20
  //  0 0 0  1] 0 0 -1 0] 0 0 0   1]





  // canvasを初期化
  gl.clearColor(0.1, 0.1, 0.1, 1.0);
  gl.clearDepth(1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);





  // ブロックを描画
  // VBOを生成し、割り当てる
  // 位置
  const blockPosVbo = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, blockPosVbo);
  gl.bufferData(gl.ARRAY_BUFFER,
    new Float32Array(blockPos), gl.STATIC_DRAW);

  const blockPosLoc = gl.getAttribLocation(prg, 'position');
  gl.enableVertexAttribArray(blockPosLoc);
  gl.vertexAttribPointer(blockPosLoc, 3, gl.FLOAT, false, 0, 0);

  // 色
  const blockColorVbo = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, blockColorVbo);
  gl.bufferData(gl.ARRAY_BUFFER,
    new Float32Array(blockColor), gl.STATIC_DRAW);

  const blockColorLoc = gl.getAttribLocation(prg, 'color');
  gl.enableVertexAttribArray(blockColorLoc);
  gl.vertexAttribPointer(blockColorLoc, 4, gl.FLOAT, false, 0, 0);

  // IBOを生成し、割り当てる
  let ibo = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
    new Int16Array(blockIndex), gl.STATIC_DRAW);

  // 変形行列
  gl.uniformMatrix4fv(
    gl.getUniformLocation(prg, "mvpMat"),
    false, tMat(mulMat(vpMat, mMat)));

  // 描画
  gl.drawElements(gl.TRIANGLES, blockIndex.length, gl.UNSIGNED_SHORT, 0);





  // 軸を描画
  // VBOを生成し、割り当てる
  // 位置
  const axisPosVbo = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, axisPosVbo);
  gl.bufferData(gl.ARRAY_BUFFER,
    new Float32Array(axisPos), gl.STATIC_DRAW);

  const axisPosLoc = gl.getAttribLocation(prg, 'position');
  gl.enableVertexAttribArray(axisPosLoc);
  gl.vertexAttribPointer(axisPosLoc, 3, gl.FLOAT, false, 0, 0);

  // 色
  const axisColorVbo = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, axisColorVbo);
  gl.bufferData(gl.ARRAY_BUFFER,
    new Float32Array(axisColor), gl.STATIC_DRAW);

  const axisColorLoc = gl.getAttribLocation(prg, 'color');
  gl.enableVertexAttribArray(axisColorLoc);
  gl.vertexAttribPointer(axisColorLoc, 4, gl.FLOAT, false, 0, 0);

  // 変形行列
  gl.uniformMatrix4fv(
    gl.getUniformLocation(prg, "mvpMat"),
    false, tMat(vpMat));

  // 描画
  gl.drawArrays(gl.LINES, 0, axisPos.length / 3);





  // 描画
  gl.flush();
}
