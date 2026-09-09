import {errorLog} from "./error.js";
import {requestOutput} from "./request-output.js";
import {gl, itemPrgInfo, axisPrgInfo} from "./canvas.js";

// アイテム/頂点情報
const blockVert = [
  // 位置:vec3, UV:vec2, 法線:vec3
  // 上
  -.5,  .5, -.5,  .25,  0,  0, 1, 0,
  -.5,  .5,  .5,  .25, .5,  0, 1, 0,
   .5,  .5, -.5,   .5,  0,  0, 1, 0,
   .5,  .5,  .5,   .5, .5,  0, 1, 0,
  // 下
  -.5, -.5, -.5,   .5,  0,  0, -1, 0,
   .5, -.5, -.5,  .75,  0,  0, -1, 0,
  -.5, -.5,  .5,   .5, .5,  0, -1, 0,
   .5, -.5,  .5,  .75, .5,  0, -1, 0,
  // 右
  -.5,  .5, -.5,    0, .5,  -1, 0, 0,
  -.5, -.5, -.5,    0,  1,  -1, 0, 0,
  -.5,  .5,  .5,  .25, .5,  -1, 0, 0,
  -.5, -.5,  .5,  .25,  1,  -1, 0, 0,
  // 前
  -.5,  .5,  .5,  .25, .5,  0, 0, 1,
  -.5, -.5,  .5,  .25,  1,  0, 0, 1,
   .5,  .5,  .5,   .5, .5,  0, 0, 1,
   .5, -.5,  .5,   .5,  1,  0, 0, 1,
  // 左
   .5,  .5,  .5,   .5, .5,  1, 0, 0,
   .5, -.5,  .5,   .5,  1,  1, 0, 0,
   .5,  .5, -.5,  .75, .5,  1, 0, 0,
   .5, -.5, -.5,  .75,  1,  1, 0, 0,
  // 後
   .5,  .5, -.5,  .75, .5,  0, 0, -1,
   .5, -.5, -.5,  .75,  1,  0, 0, -1,
  -.5,  .5, -.5,    1, .5,  0, 0, -1,
  -.5, -.5, -.5,    1,  1,  0, 0, -1,
];
// アイテム/インデックス
const blockIndex = [
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
];
// 軸/頂点情報
const axisVert = [
  // 位置:vec3, 色:vec3
  // xyz軸
  0, 0, 0,  1, 0, 0,
  5, 0, 0,  1, 0, 0,
  0, 0, 0,  0, 1, 0,
  0, 5, 0,  0, 1, 0,
  0, 0, 0,  0, 0, 1,
  0, 0, 5,  0, 0, 1,
];
for (let i = -4.5; i < 5; i++) {
  axisVert.push(
    // xz平面
    -5, 0, i,  .4, .4, .4,
     5, 0, i,  .4, .4, .4,
    i, 0, -5,  .4, .4, .4,
    i, 0,  5,  .4, .4, .4,
  );
}

export let blockVao, axisVao;

export const blockIndexCount = blockIndex.length;
export const axisVertCount = axisVert.length / 6;

// ブロックテクスチャ
export const itemList = {
  diamond_block: {
    number: 1,
    image: new Image(),
    loaded: false,
  },
  carved_pumpkin: {
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



  // ブロックのVAOを生成
  blockVao = gl.createVertexArray();
  {
    gl.bindVertexArray(blockVao);

    // ブロックのVBOを生成
    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(blockVert), gl.STATIC_DRAW);
    gl.vertexAttribPointer(itemPrgInfo.position, 3, gl.FLOAT, false, 8 * Float32Array.BYTES_PER_ELEMENT, 0);
    gl.vertexAttribPointer(itemPrgInfo.uv, 2, gl.FLOAT, false, 8 * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT);
    gl.vertexAttribPointer(itemPrgInfo.normal, 3, gl.FLOAT, false, 8 * Float32Array.BYTES_PER_ELEMENT, 5 * Float32Array.BYTES_PER_ELEMENT);
    gl.enableVertexAttribArray(itemPrgInfo.position);
    gl.enableVertexAttribArray(itemPrgInfo.uv);
    gl.enableVertexAttribArray(itemPrgInfo.normal);

    // ブロックのIBOを生成
    const ibo = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(blockIndex), gl.STATIC_DRAW);

    gl.bindVertexArray(null);
  }

  // 軸のVAOを生成
  axisVao = gl.createVertexArray();
  {
    gl.bindVertexArray(axisVao);

    // 軸のVBOを生成
    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(axisVert), gl.STATIC_DRAW);
    gl.vertexAttribPointer(axisPrgInfo.position, 3, gl.FLOAT, false, 6 * Float32Array.BYTES_PER_ELEMENT, 0);
    gl.vertexAttribPointer(axisPrgInfo.color, 3, gl.FLOAT, false, 6 * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT);
    gl.enableVertexAttribArray(axisPrgInfo.position);
    gl.enableVertexAttribArray(axisPrgInfo.color);

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
    item.image.addEventListener("error", () => {
      errorLog(`画像 ${itemName} の読み込みに失敗しました`);
    });
  }

  // ブロック選択
  const previewItem = document.getElementById("preview-item");

  // ブロック変更時の処理
  previewItem.addEventListener("change", e => {
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
