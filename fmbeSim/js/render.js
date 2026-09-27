// 行列演算
import * as Matrix from "./matrix.js";
import {cos, sin} from "./deg.js";
import {paramList} from "./param.js";
import {canvas, gl, cubePrgInfo, linePrgInfo, viewPitch, viewYaw, viewScale} from "./canvas.js";
import {itemModelList, itemList, nowItemName} from "./item.js";
import {lineModel} from "./line.js";
import {registerOutput} from "./request-output.js";



// canvasアスペクト比
let aspect = 1;

// キャンバスリサイズ
function resize() {
  canvas.width = canvas.clientWidth * devicePixelRatio;
  canvas.height = canvas.clientHeight * devicePixelRatio;
  aspect = canvas.clientHeight / canvas.clientWidth;

  if (!gl) return;
  gl.viewport(0, 0, canvas.width, canvas.height);
}



// 描画
function render() {
  if (!gl) return;

  // 行列
  // FMBEによる変形
  let mMat = Matrix.mul(
    [ // pos
      1, 0, 0, paramList.get("xpos").value / 16,
      0, 1, 0, paramList.get("ypos").value / 16 + 0.5,
      0, 0, 1, paramList.get("zpos").value / 16,
      0, 0, 0, 1
    ],
    [ // yrot
      cos(paramList.get("yrot").value), 0, -sin(paramList.get("yrot").value), 0,
      0, 1, 0, 0,
      sin(paramList.get("yrot").value), 0, cos(paramList.get("yrot").value), 0,
      0, 0, 0, 1
    ],
    [ // zrot
      cos(paramList.get("zrot").value), sin(paramList.get("zrot").value), 0, 0,
      -sin(paramList.get("zrot").value), cos(paramList.get("zrot").value), 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ],
    [ // xrot
      1, 0, 0, 0,
      0, cos(paramList.get("xrot").value), -sin(paramList.get("xrot").value), 0,
      0, sin(paramList.get("xrot").value), cos(paramList.get("xrot").value), 0,
      0, 0, 0, 1
    ],
    [ // scale
      paramList.get("scale").value * paramList.get("xzscale").value, 0, 0, 0,
      0, paramList.get("scale").value * paramList.get("yscale").value, 0, 0,
      0, 0, paramList.get("scale").value * paramList.get("xzscale").value, 0,
      0, 0, 0, 1
    ],
    [ // basepos
      1, 0, 0, paramList.get("xbasepos").value / 16,
      0, 1, 0, paramList.get("ybasepos").value / 16,
      0, 0, 1, paramList.get("zbasepos").value / 16,
      0, 0, 0, 1
    ],
  );
  // カメラの角度・透視投影
  let vpMat = Matrix.mul(
    [ // perspective
      aspect * 2 ** viewScale, 0, 0, 0,
      0, 2 ** viewScale, 0, 0,
      0, 0, -1, 19,
      0, 0, -1, 20
    ],
    [ // viewPitch
      1, 0, 0, 0,
      0, cos(viewPitch), -sin(viewPitch), 0,
      0, sin(viewPitch), cos(viewPitch), 0,
      0, 0, 0, 1
    ],
    [ // viewYaw
      cos(viewYaw), 0, sin(viewYaw), 0,
      0, 1, 0, 0,
      -sin(viewYaw), 0, cos(viewYaw), 0,
      0, 0, 0, 1
    ],
  );
  // [a*vS  0 0 0 [1 0 0  0 [1 0  0 0 [1 0 0   0
  //     0 vS 0 0  0 1 0  0  0 1  0 0  0 1 0   0
  //     0  0 1 0  0 0 1 -1  0 0  0 1  0 0 1 -20
  //     0  0 0 1] 0 0 0  1] 0 0 -1 0] 0 0 0   1]


  // canvasを初期化
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);



  // アイテム
  const item = itemList[nowItemName];
  const model = itemModelList[item.model];

  gl.useProgram(cubePrgInfo.prg);
  // VBO
  gl.bindVertexArray(model.vao);
  // テクスチャ
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, item.texture);
  gl.uniform1i(cubePrgInfo.tex, item.loadState === "loaded" ? 1 : 0);
  // 変形行列
  gl.uniformMatrix4fv(cubePrgInfo.mvpMat, true, Matrix.mul(vpMat, mMat));
  gl.uniformMatrix4fv(cubePrgInfo.mAdjMat, true, Matrix.t(Matrix.adj(mMat)));
  // 描画
  gl.drawElements(gl.TRIANGLES, model.count, gl.UNSIGNED_SHORT, 0);

  // 線
  gl.useProgram(linePrgInfo.prg);
  // VBO
  gl.bindVertexArray(lineModel.vao);
  // 変形行列
  gl.uniformMatrix4fv(linePrgInfo.mvpMat, true, vpMat);
  // 描画
  gl.drawArrays(gl.LINES, 0, lineModel.count);
}



export function initRender() {
  registerOutput("resize", resize);
  registerOutput("render", render);
}
