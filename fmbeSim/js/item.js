import {errorLog} from "./error.js";
import {requestOutput} from "./request-output.js";
import {gl, itemPrgInfo, linePrgInfo} from "./canvas.js";



// ブロックテクスチャ
export const itemList = {
  diamond_block: {
    name: "Diamond block",
    model: "full",
    category: "Block (Solid)",
  },
  carved_pumpkin: {
    name: "Carved pumpkin",
    model: "full",
    category: "Block (Solid)",
  },
  cartography_table: {
    name: "Cartography table",
    model: "full",
    category: "Block (Solid)",
  },
  chain_command_block: {
    name: "Chain command block",
    model: "full",
    category: "Block (Solid)",
  },
  alex: {
    name: "Alex head block",
    model: "full",
    category: "Block (Solid)",
  },
  dummy: {
    name: "Dummy",
    model: "full",
    category: "Block (Solid)",
  },
};

export let nowItemName = Object.keys(itemList)[0];

const categoryList = ["Block (Solid)", "Block (Plane)", "Item"];



// アイテムモデル
// vert: 
export const itemModelList = {
  full: {
    cubeList: [
      [
        -.5, -.5, -.5,   .5,  .5,  .5, // 位置
          0,  .5,       .25,   1,      // UV/x-
         .5,  .5,       .75,   1,      // UV/x+
         .5,   0,       .75,  .5,      // UV/y-
        .25,   0,        .5,  .5,      // UV/y+
        .75,  .5,         1,   1,      // UV/z-
        .25,  .5,        .5,   1,      // UV/z+
      ],
    ],
  },
};



export const lineModel = {
  vert: [
    // 位置: vec3, 色: vec3
    0, 0, 0,  1, 0, 0, // x軸
    5, 0, 0,  1, 0, 0,
    0, 0, 0,  0, 1, 0, // y軸
    0, 5, 0,  0, 1, 0,
    0, 0, 0,  0, 0, 1, // z軸
    0, 0, 5,  0, 0, 1,
  ],
};
for (let i = -4.5; i < 5; i++) {
  lineModel.vert.push(
    -5, 0, i,  .4, .4, .4, // x平面
     5, 0, i,  .4, .4, .4,
    i, 0, -5,  .4, .4, .4, // z平面
    i, 0,  5,  .4, .4, .4,
  );
}



export function initItem() {
  if (!gl) return;



  // アイテム/モデル作成
  for (const [modelName, model] of Object.entries(itemModelList)) {
    // 頂点・インデックス
    model.vert = [];
    model.index = [];

    model.cubeList.forEach((cube, i) => {
      if (cube.length !== 30) throw Error(`itemModelList.${modelName}.cubeList[${i}].length != 30`);

      model.vert.push(
        // 位置:vec3, UV:vec2, 法線:vec3
        // x-
        cube[0], cube[4], cube[2],  cube[ 6], cube[ 7],  -1, 0, 0,
        cube[0], cube[1], cube[2],  cube[ 6], cube[ 9],  -1, 0, 0,
        cube[0], cube[1], cube[5],  cube[ 8], cube[ 9],  -1, 0, 0,
        cube[0], cube[4], cube[5],  cube[ 8], cube[ 7],  -1, 0, 0,
        // x+
        cube[3], cube[4], cube[5],  cube[10], cube[11],  1, 0, 0,
        cube[3], cube[1], cube[5],  cube[10], cube[13],  1, 0, 0,
        cube[3], cube[1], cube[2],  cube[12], cube[13],  1, 0, 0,
        cube[3], cube[4], cube[2],  cube[12], cube[11],  1, 0, 0,
        // y-
        cube[3], cube[1], cube[2],  cube[14], cube[15],  0, -1, 0,
        cube[3], cube[1], cube[5],  cube[14], cube[17],  0, -1, 0,
        cube[0], cube[1], cube[5],  cube[16], cube[17],  0, -1, 0,
        cube[0], cube[1], cube[2],  cube[16], cube[15],  0, -1, 0,
        // y+
        cube[0], cube[4], cube[2],  cube[18], cube[19],  0, 1, 0,
        cube[0], cube[4], cube[5],  cube[18], cube[21],  0, 1, 0,
        cube[3], cube[4], cube[5],  cube[20], cube[21],  0, 1, 0,
        cube[3], cube[4], cube[2],  cube[20], cube[19],  0, 1, 0,
        // z-
        cube[3], cube[4], cube[2],  cube[22], cube[23],  0, 0, -1,
        cube[3], cube[1], cube[2],  cube[22], cube[25],  0, 0, -1,
        cube[0], cube[1], cube[2],  cube[24], cube[25],  0, 0, -1,
        cube[0], cube[4], cube[2],  cube[24], cube[23],  0, 0, -1,
        // z+
        cube[0], cube[4], cube[5],  cube[26], cube[27],  0, 0, 1,
        cube[0], cube[1], cube[5],  cube[26], cube[29],  0, 0, 1,
        cube[3], cube[1], cube[5],  cube[28], cube[29],  0, 0, 1,
        cube[3], cube[4], cube[5],  cube[28], cube[27],  0, 0, 1,
      );

      for (let j = 0; j < 6; j++) {
        const k = i * 24 + j * 4;
        model.index.push(
          k    , k + 1, k + 2,
          k + 2, k + 3, k    ,
        );
      }
    });

    // 頂点数
    model.count = model.cubeList.length * 36;


    // VAO
    model.vao = gl.createVertexArray();
    {
      gl.bindVertexArray(model.vao);

      // VBO
      const vbo = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.vert), gl.STATIC_DRAW);
      gl.vertexAttribPointer(itemPrgInfo.position, 3, gl.FLOAT, false, 8 * Float32Array.BYTES_PER_ELEMENT, 0);
      gl.vertexAttribPointer(itemPrgInfo.uv, 2, gl.FLOAT, false, 8 * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT);
      gl.vertexAttribPointer(itemPrgInfo.normal, 3, gl.FLOAT, false, 8 * Float32Array.BYTES_PER_ELEMENT, 5 * Float32Array.BYTES_PER_ELEMENT);
      gl.enableVertexAttribArray(itemPrgInfo.position);
      gl.enableVertexAttribArray(itemPrgInfo.uv);
      gl.enableVertexAttribArray(itemPrgInfo.normal);

      // IBO
      const ibo = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(model.index), gl.STATIC_DRAW);

      gl.bindVertexArray(null);
    }
  }



  // 線/モデル作成
  // 頂点数
  lineModel.count = lineModel.vert.length / 6;

  // VAO
  lineModel.vao = gl.createVertexArray()
  {
    gl.bindVertexArray(lineModel.vao);

    // VBO
    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(lineModel.vert), gl.STATIC_DRAW);
    gl.vertexAttribPointer(linePrgInfo.position, 3, gl.FLOAT, false, 6 * Float32Array.BYTES_PER_ELEMENT, 0);
    gl.vertexAttribPointer(linePrgInfo.color, 3, gl.FLOAT, false, 6 * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT);
    gl.enableVertexAttribArray(linePrgInfo.position);
    gl.enableVertexAttribArray(linePrgInfo.color);

    gl.bindVertexArray(null);
  }




  // 警告消し用テクスチャ
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 255, 255, 255]));
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  gl.activeTexture(gl.TEXTURE1);
  // テクスチャを生成
  function imgOnloaded(itemName, item) {
    item.texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, item.texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, item.image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    item.loaded = true;
    if (nowItemName === itemName) {
      requestOutput({render: true});
    }
  }

  for (const [itemName, item] of Object.entries(itemList)) {
    item.loaded = false;
    // 画像読み込み
    item.image = new Image();
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

  // 描画アイテム変更時の処理
  const previewItem = document.getElementById("preview-item");
  previewItem.addEventListener("change", e => {
    nowItemName = e.target.value;
    requestOutput({render: true});
  });

  // 描画アイテム変更の選択肢を生成
  categoryList.forEach(category => {
    const itemNameList = Object.keys(itemList).filter(itemName => itemList[itemName].category === category);
    if (itemNameList.length === 0) return;

    const optgroup = document.createElement("optgroup");
    optgroup.label = category;

    itemNameList.forEach(itemName => {
      const option = document.createElement("option");
      option.value = itemName;
      option.textContent = itemList[itemName].name;
      optgroup.appendChild(option);
    });

    previewItem.appendChild(optgroup);
  });
}
