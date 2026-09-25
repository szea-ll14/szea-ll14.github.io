import {gl, linePrgInfo} from "./canvas.js";


export const lineModel = {};

const lineVert = [
  // 位置: vec3, 色: vec3
  0, 0, 0,  1, 0, 0, // x軸
  5, 0, 0,  1, 0, 0,
  0, 0, 0,  0, 1, 0, // y軸
  0, 5, 0,  0, 1, 0,
  0, 0, 0,  0, 0, 1, // z軸
  0, 0, 5,  0, 0, 1,
];
for (let i = -4.5; i < 5; i++) {
  lineVert.push(
    -5, 0, i,  .4, .4, .4, // x平面
     5, 0, i,  .4, .4, .4,
    i, 0, -5,  .4, .4, .4, // z平面
    i, 0,  5,  .4, .4, .4,
  );
}



export function initLine() {
  if (!gl) return;

  // モデル作成
  // 頂点数
  const count = lineVert.length / 6;

  // VAO
  const vao = gl.createVertexArray();
  {
    gl.bindVertexArray(vao);

    // VBO
    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(lineVert), gl.STATIC_DRAW);
    gl.vertexAttribPointer(linePrgInfo.position, 3, gl.FLOAT, false, 6 * Float32Array.BYTES_PER_ELEMENT, 0);
    gl.vertexAttribPointer(linePrgInfo.color, 3, gl.FLOAT, false, 6 * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT);
    gl.enableVertexAttribArray(linePrgInfo.position);
    gl.enableVertexAttribArray(linePrgInfo.color);

    gl.bindVertexArray(null);
  }

  lineModel.count = count;
  lineModel.vao = vao;
}
