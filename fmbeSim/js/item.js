import {requestOutput} from "./request-output.js";
import {gl, prg} from "./canvas.js";

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
const blockIndex = new Uint16Array([
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

export let blockVao, axisVao;

export const blockVertCount = blockIndex.length;
export const axisVertCount = axisVert.length / 6;

// ブロックテクスチャ
export const itemList = {
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
export let nowItemName = "diamond_block";



export function initItem() {
  if (!gl) return;

  // シェーダー内の変数の場所を取得
  const posLoc = gl.getAttribLocation(prg, 'position');
  const colorLoc = gl.getAttribLocation(prg, 'color');
  const uvLoc = gl.getAttribLocation(prg, 'uv');
  const normalLoc = gl.getAttribLocation(prg, 'normal');

  // ブロックのVAOを生成
  blockVao = gl.createVertexArray();
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
  axisVao = gl.createVertexArray();
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



  // テクスチャを生成
  function imgOnloaded(itemName, item) {
    gl.activeTexture(gl.TEXTURE0 + item.number);
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, item.image);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    item.loaded = true;
    if (nowItemName == itemName) {
      requestOutput({render: true});
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
    requestOutput({render: true});
  });

  // 警告消し用テクスチャ
  {
    gl.activeTexture(gl.TEXTURE0);
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 255, 255, 255]));
  }
}