// WebGLコンテキストを取得
const canvas = document.getElementById('canvas');
const gl = canvas.getContext('webgl');

// canvasを初期化
gl.clearColor(0.1, 0.1, 0.1, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);

// シェーダーをコンパイル
const vertSource = document.getElementById('vertShader').textContent;
const vertShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertShader, vertSource);
gl.compileShader(vertShader);
const fragSource = document.getElementById('fragShader').textContent;
const fragShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragShader, fragSource);
gl.compileShader(fragShader);

// プログラムオブジェクトを作成
const program = gl.createProgram();

// シェーダーをリンク
gl.attachShader(program, vertShader);
gl.deleteShader(vertShader);
gl.attachShader(program, fragShader);
gl.deleteShader(fragShader);
gl.linkProgram(program);

// プログラムオブジェクトを有効にする
gl.useProgram(program);


// 3つの頂点の座標を定義する
const blockvertexPos = [
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

// 頂点バッファを作成する
const triangleVertexBuffer = gl.createBuffer();
// 頂点バッファをバインドする
gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexBuffer);
// 頂点バッファに頂点データをセットする
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(blockvertexPos), gl.STATIC_DRAW);

// Positionのロケーションを取得し、バッファを割り当てる
const positionLocation = gl.getAttribLocation(program, 'position');
gl.enableVertexAttribArray(positionLocation);
gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

// 描画する
gl.drawArrays(gl.TRIANGLES, 0, 3);
gl.flush();

const fmbeVarList = [
  "xpos", "ypos", "zpos",
  "xrot", "yrot", "zrot",
  "scale", "xzscale", "yscale",
  "xbasepos", "ybasepos", "zbasepos",
]

for (const fmbeVar of fmbeVarList) {
  document.getElementById(fmbeVar)
}

function reset() {}
