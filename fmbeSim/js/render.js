// 行列演算
import * as Matrix from "./matrix.js";
// 度
const DEG = Math.PI / 180;

import {paramList} from "./param.js";
import {canvas, gl, itemPrgInfo, linePrgInfo, viewPitch, viewYaw, viewScale} from "./canvas.js";
import {itemModelList, lineModel, itemList, nowItemName} from "./item.js";



// canvasアスペクト比
let aspect = 1;

// キャンバスリサイズ
export function resize() {
  canvas.width = canvas.clientWidth * devicePixelRatio;
  canvas.height = canvas.clientHeight * devicePixelRatio;
  aspect = canvas.clientHeight / canvas.clientWidth;

  if (!gl) return;
  gl.viewport(0, 0, canvas.width, canvas.height);
}



// 描画
export function render() {
  if (!gl) return;

  // 行列
  // FMBEによる変形
  let mMat = [ // basepos
    1, 0, 0, paramList.get("xbasepos").value / 16,
    0, 1, 0, paramList.get("ybasepos").value / 16,
    0, 0, 1, paramList.get("zbasepos").value / 16,
    0, 0, 0, 1
  ];
  mMat = Matrix.mul([ // scale
    paramList.get("scale").value * paramList.get("xzscale").value, 0, 0, 0,
    0, paramList.get("scale").value * paramList.get("yscale").value, 0, 0,
    0, 0, paramList.get("scale").value * paramList.get("xzscale").value, 0,
    0, 0, 0, 1
  ], mMat);
  mMat = Matrix.mul([ // xrot
    1, 0, 0, 0,
    0, Math.cos(paramList.get("xrot").value * DEG), -Math.sin(paramList.get("xrot").value * DEG), 0,
    0, Math.sin(paramList.get("xrot").value * DEG), Math.cos(paramList.get("xrot").value * DEG), 0,
    0, 0, 0, 1
  ], mMat);
  mMat = Matrix.mul([ // zrot
    Math.cos(paramList.get("zrot").value * DEG), Math.sin(paramList.get("zrot").value * DEG), 0, 0,
    -Math.sin(paramList.get("zrot").value * DEG), Math.cos(paramList.get("zrot").value * DEG), 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
  ], mMat);
  mMat = Matrix.mul([ // yrot
    Math.cos(paramList.get("yrot").value * DEG), 0, -Math.sin(paramList.get("yrot").value * DEG), 0,
    0, 1, 0, 0,
    Math.sin(paramList.get("yrot").value * DEG), 0, Math.cos(paramList.get("yrot").value * DEG), 0,
    0, 0, 0, 1
  ], mMat);
  mMat = Matrix.mul([ // pos
    1, 0, 0, paramList.get("xpos").value / 16,
    0, 1, 0, paramList.get("ypos").value / 16 + 0.5,
    0, 0, 1, paramList.get("zpos").value / 16,
    0, 0, 0, 1
  ], mMat);
  // カメラの角度・透視投影
  let vpMat = [ // viewYaw
    Math.cos(viewYaw * DEG), 0, Math.sin(viewYaw * DEG), 0,
    0, 1, 0, 0,
    -Math.sin(viewYaw * DEG), 0, Math.cos(viewYaw * DEG), 0,
    0, 0, 0, 1
  ];
  vpMat = Matrix.mul([ // viewPitch
    1, 0, 0, 0,
    0, Math.cos(viewPitch * DEG), -Math.sin(viewPitch * DEG), 0,
    0, Math.sin(viewPitch * DEG), Math.cos(viewPitch * DEG), 0,
    0, 0, 0, 1
  ], vpMat);
  vpMat = Matrix.mul([ // perspective
    aspect * 2 ** viewScale, 0, 0, 0,
    0, 2 ** viewScale, 0, 0,
    0, 0, -1, 19,
    0, 0, -1, 20
  ], vpMat);
  // [a*vS  0 0 0 [1 0 0  0 [1 0  0 0 [1 0 0   0
  //     0 vS 0 0  0 1 0  0  0 1  0 0  0 1 0   0
  //     0  0 1 0  0 0 1 -1  0 0  0 1  0 0 1 -20
  //     0  0 0 1] 0 0 0  1] 0 0 -1 0] 0 0 0   1]


  // canvasを初期化
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);



  // アイテム
  const item = itemList[nowItemName];
  const model = itemModelList[item.model];

  gl.useProgram(itemPrgInfo.prg);
  // VBO
  gl.bindVertexArray(model.vao);
  // テクスチャ
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, item.texture);
  gl.uniform1i(itemPrgInfo.tex, item.loaded ? 1 : 0);
  // 変形行列
  gl.uniformMatrix4fv(itemPrgInfo.mvpMat, true, Matrix.mul(vpMat, mMat));
  gl.uniformMatrix4fv(itemPrgInfo.mAdjMat, true, Matrix.t(Matrix.adj(mMat)));
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
