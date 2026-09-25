import {errorLog} from "./error.js";
import {requestOutput} from "./request-output.js";
import {gl, cubePrgInfo} from "./canvas.js";



// ブロックテクスチャ
export const itemList = {
  // dummy: {
  //   name: "Dummy",
  //   model: "full",
  //   category: "Block (Solid)",
  // },
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
};

for (const item of Object.values(itemList)) {
  item.loadState = "idle";
}

export let nowItemName = Object.keys(itemList)[0];

const categoryList = ["Block (Solid)", "Block (Plane)", "Item"];



// アイテムモデル
const cubeListList = {
  full: [
    [
      -.5, -.5, -.5,   .5,  .5,  .5, // XYZ
        0,   0,         1,   1,      // UV
    ],
  ],
};
export const itemModelList = {};



export function initItem() {
  if (!gl) return;



  // モデル作成
  for (const [modelName, cubeList] of Object.entries(cubeListList)) {
    // 頂点・インデックス
    const vert = [];
    const index = [];

    for (const [i, cube] of cubeList.entries()) {
      if (cube.length !== 10) throw Error(`Invalid cube data length`);

      const [u0, u1, u2, u3, u4] = [0, 1, 2, 3, 4].map(i => (cube[6] * (4 - i) + cube[8] * i) / 4);
      const [v0, v1, v2] = [0, 1, 2].map(i => (cube[7] * (2 - i) + cube[9] * i) / 2);

      vert.push(
        // 位置:vec3, UV:vec2, 法線:vec3
        // x-
        cube[0], cube[4], cube[2],  u0, v1,  -1, 0, 0,
        cube[0], cube[1], cube[2],  u0, v2,  -1, 0, 0,
        cube[0], cube[1], cube[5],  u1, v2,  -1, 0, 0,
        cube[0], cube[4], cube[5],  u1, v1,  -1, 0, 0,
        // x+
        cube[3], cube[4], cube[5],  u2, v1,  1, 0, 0,
        cube[3], cube[1], cube[5],  u2, v2,  1, 0, 0,
        cube[3], cube[1], cube[2],  u3, v2,  1, 0, 0,
        cube[3], cube[4], cube[2],  u3, v1,  1, 0, 0,
        // y-
        cube[3], cube[1], cube[2],  u3, v0,  0, -1, 0,
        cube[3], cube[1], cube[5],  u3, v1,  0, -1, 0,
        cube[0], cube[1], cube[5],  u2, v1,  0, -1, 0,
        cube[0], cube[1], cube[2],  u2, v0,  0, -1, 0,
        // y+
        cube[0], cube[4], cube[2],  u1, v0,  0, 1, 0,
        cube[0], cube[4], cube[5],  u1, v1,  0, 1, 0,
        cube[3], cube[4], cube[5],  u2, v1,  0, 1, 0,
        cube[3], cube[4], cube[2],  u2, v0,  0, 1, 0,
        // z-
        cube[3], cube[4], cube[2],  u3, v1,  0, 0, -1,
        cube[3], cube[1], cube[2],  u3, v2,  0, 0, -1,
        cube[0], cube[1], cube[2],  u4, v2,  0, 0, -1,
        cube[0], cube[4], cube[2],  u4, v1,  0, 0, -1,
        // z+
        cube[0], cube[4], cube[5],  u1, v1,  0, 0, 1,
        cube[0], cube[1], cube[5],  u1, v2,  0, 0, 1,
        cube[3], cube[1], cube[5],  u2, v2,  0, 0, 1,
        cube[3], cube[4], cube[5],  u2, v1,  0, 0, 1,
      );

      for (let j = 0; j < 6; j++) {
        const k = i * 24 + j * 4;
        index.push(
          k    , k + 1, k + 2,
          k + 2, k + 3, k    ,
        );
      }
    }

    // 頂点数
    const count = cubeList.length * 36;


    // VAO
    const vao = gl.createVertexArray();
    {
      gl.bindVertexArray(vao);

      // VBO
      const vbo = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vert), gl.STATIC_DRAW);
      gl.vertexAttribPointer(cubePrgInfo.position, 3, gl.FLOAT, false, 8 * Float32Array.BYTES_PER_ELEMENT, 0);
      gl.vertexAttribPointer(cubePrgInfo.uv, 2, gl.FLOAT, false, 8 * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT);
      gl.vertexAttribPointer(cubePrgInfo.normal, 3, gl.FLOAT, false, 8 * Float32Array.BYTES_PER_ELEMENT, 5 * Float32Array.BYTES_PER_ELEMENT);
      gl.enableVertexAttribArray(cubePrgInfo.position);
      gl.enableVertexAttribArray(cubePrgInfo.uv);
      gl.enableVertexAttribArray(cubePrgInfo.normal);

      // IBO
      const ibo = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(index), gl.STATIC_DRAW);

      gl.bindVertexArray(null);
    }

    itemModelList[modelName] = {count, vao};
  }



  // 警告消し用テクスチャ
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 255, 255, 255]));
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  // テクスチャを生成
  function changeItem(itemName) {
    nowItemName = itemName;
    const item = itemList[itemName];

    if (item.loadState === "idle") {
      item.loadState = "loading";

      // 画像読み込み
      const image = new Image();
      image.src = `./img/${itemName}.png`;

      // 完了したらテクスチャを生成
      image.addEventListener("load", () => {
        gl.activeTexture(gl.TEXTURE1);
        item.texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, item.texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        item.loadState = "loaded";

        if (nowItemName === itemName) {
          requestOutput({render: true});
        }
      });

      // 失敗したらログ
      image.addEventListener("error", () => {
        item.loadState = "failed";
        errorLog(`Failed to load the image ${itemName}.png.`);
      });
    }

    requestOutput({render: true});
  }



  // 描画アイテム変更時の処理
  const previewItem = document.getElementById("preview-item");
  previewItem.addEventListener("change", e => {
    changeItem(e.target.value);
  });

  // 描画アイテム変更の選択肢を生成
  for (const category of categoryList) {
    const itemNameList = Object.keys(itemList).filter(itemName => itemList[itemName].category === category);
    if (itemNameList.length === 0) continue;

    const optgroup = document.createElement("optgroup");
    optgroup.label = category;

    for (const itemName of itemNameList) {
      const option = document.createElement("option");
      option.value = itemName;
      option.textContent = itemList[itemName].name;
      optgroup.appendChild(option);
    }

    previewItem.appendChild(optgroup);
  }

  previewItem.value = nowItemName;
  changeItem(nowItemName);
}
