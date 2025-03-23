document.addEventListener('DOMContentLoaded', () => {
  // HTMLからcanvas要素を取得する
  const canvas = document.getElementById('canvas');

  // canvas要素からwebglコンテキストを取得する
  const gl = canvas.getContext('webgl');
  if (!gl) {
    alert('webgl not supported!');
    return;
  }

  // canvasを初期化する
  gl.clearColor(0.9, 0.9, 0.9, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // プログラムオブジェクトを作成する
  const program = gl.createProgram();  

  // シェーダのソースを取得する
  const vertexShaderSource = document.getElementById('vertexShader').textContent;
  const fragmentShaderSource = document.getElementById('fragmentShader').textContent;

  // シェーダをコンパイルして、プログラムオブジェクトにシェーダを割り当てる
  const vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader, vertexShaderSource);
  gl.compileShader(vertexShader);
  gl.attachShader(program, vertexShader);
  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader, fragmentShaderSource);
  gl.compileShader(fragmentShader);
  gl.attachShader(program, fragmentShader);

  // シェーダをリンクする
  gl.linkProgram(program);
  // プログラムオブジェクトを有効にする
  gl.useProgram(program);

  // 3つの頂点の座標を定義する
  const triangleVertexPosition = [
    0.0, 0.8, 0.0,
    -0.8, -0.8, 0.0,
    0.8, -0.8, 0.0
  ];

  // 頂点バッファを作成する
  const triangleVertexBuffer = gl.createBuffer();
  // 頂点バッファをバインドする
  gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexBuffer);
  // 頂点バッファに頂点データをセットする
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVertexPosition), gl.STATIC_DRAW);
  
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

  function reset(fmbeVar) {}

});
