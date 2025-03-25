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
const viewXrot = 0, viewYrot = 0;

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
setCmd();

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





// canvasを初期化
gl.clearColor(0.1, 0.1, 0.1, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);

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





// 頂点座標を定義
const blockVertexPos = [
  // above
  // below
  // left
  // front
  // right
  // back
  0.0, 0.8, 0.0,
  -0.8, -0.8, 0.0,
  0.8, -0.8, 0.0
];

// 頂点バッファを生成
const vbo = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
gl.bufferData(gl.ARRAY_BUFFER,
  new Float32Array(blockVertexPos), gl.STATIC_DRAW);

// Positionのロケーションを取得し、バッファを割り当てる
const positionLocation = gl.getAttribLocation(prg, 'position');
gl.enableVertexAttribArray(positionLocation);
gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);





// 行列
// FMBEによる変形
let baseposMat = [
  1, 0, 0, varData.xbasepos.value / 16,
  0, 1, 0, varData.ybasepos.value / 16,
  0, 0, 1, varData.zbasepos.value / 16,
  0, 0, 0, 1
];
let scaleMat = [
  varData.scale.value * varData.xzscale.value, 0, 0, 0,
  0, varData.scale.value * varData.yscale.value, 0, 0,
  0, 0, varData.scale.value * varData.xzscale.value, 0,
  0, 0, 0, 1
];
let xrotMat = [
  1, 0, 0, 0,
  0, Math.cos(varData.xrot.value * deg), -Math.sin(varData.xrot.value * deg), 0,
  0, Math.sin(varData.xrot.value * deg), Math.cos(varData.xrot.value * deg), 0,
  0, 0, 0, 1
];
let zrotMat = [
  Math.cos(varData.zrot.value * deg), Math.sin(varData.zrot.value * deg), 0, 0,
  -Math.sin(varData.zrot.value * deg), Math.cos(varData.zrot.value * deg), 0, 0,
  0, 0, 1, 0,
  0, 0, 0, 1
];
let yrotMat = [
  Math.cos(varData.yrot.value * deg), 0, -Math.sin(varData.yrot.value * deg), 0,
  0, 1, 0, 0,
  Math.sin(varData.yrot.value * deg), 0, Math.cos(varData.yrot.value * deg), 0,
  0, 0, 0, 1
];
let posMat = [
  1, 0, 0, varData.xpos.value / 16,
  0, 1, 0, varData.ypos.value / 16,
  0, 0, 1, varData.zpos.value / 16,
  0, 0, 0, 1
];
// カメラの角度
let viewXrotMat = [
  1, 0, 0, 0,
  0, Math.cos(viewXrot * deg), -Math.sin(viewXrot * deg), 0,
  0, Math.sin(viewXrot * deg), Math.cos(viewXrot * deg), 0,
  0, 0, 0, 1
];
let viewYrotMat = [
  Math.cos(viewYrot * deg), 0, Math.sin(viewYrot * deg), 0,
  0, 1, 0, 0,
  -Math.sin(viewYrot * deg), 0, Math.cos(viewYrot * deg), 0,
  0, 0, 0, 1
];
// 透視投影
let persMat = [
  10, 0, 0, 0,
  0, 10, 0, 0,
  0, 0, 1, -49,
  0, 0, -1, 50
];
// [10  0 0  0 [1 0  0 0 [1 0 0   0
//   0 10 0  0  0 1  0 0  0 1 0   0
//   0  0 1 -1  0 0  0 1  0 0 1 -50
//   0  0 0  1] 0 0 -1 0] 0 0 0   1]

// uniform変数に行列を設定
gl.uniformMatrix4fv(
  gl.getUniformLocation(prg, "baseposMat"),
  false, tMat(baseposMat));
gl.uniformMatrix4fv(
  gl.getUniformLocation(prg, "scaleMat"),
  false, tMat(scaleMat));
gl.uniformMatrix4fv(
  gl.getUniformLocation(prg, "xrotMat"),
  false, tMat(xrotMat));
gl.uniformMatrix4fv(
  gl.getUniformLocation(prg, "zrotMat"),
  false, tMat(zrotMat));
gl.uniformMatrix4fv(
  gl.getUniformLocation(prg, "yrotMat"),
  false, tMat(yrotMat));
gl.uniformMatrix4fv(
  gl.getUniformLocation(prg, "posMat"),
  false, tMat(posMat));
gl.uniformMatrix4fv(
  gl.getUniformLocation(prg, "viewXrotMat"),
  false, tMat(viewXrotMat));
gl.uniformMatrix4fv(
  gl.getUniformLocation(prg, "viewYrotMat"),
  false, tMat(viewYrotMat));
gl.uniformMatrix4fv(
  gl.getUniformLocation(prg, "persMat"),
  false, tMat(persMat));





// 描画する
gl.drawArrays(gl.TRIANGLES, 0, 3);
gl.flush();




