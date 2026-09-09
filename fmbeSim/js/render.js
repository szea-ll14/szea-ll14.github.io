// 行列演算
import * as Matrix from "./matrix.js";
// 度
const DEG = Math.PI / 180;

import {paramList} from "./param.js";
import {canvas, gl, itemPrgInfo, axisPrgInfo, viewPitch, viewYaw, viewScale} from "./canvas.js";
import {blockVao, axisVao, blockVertCount, axisVertCount, itemList, nowItemName} from "./item.js";



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
    1, 0, 0, paramList.xbasepos.value / 16,
    0, 1, 0, paramList.ybasepos.value / 16,
    0, 0, 1, paramList.zbasepos.value / 16,
    0, 0, 0, 1
  ];
  mMat = Matrix.mul([ // scale
    paramList.scale.value * paramList.xzscale.value, 0, 0, 0,
    0, paramList.scale.value * paramList.yscale.value, 0, 0,
    0, 0, paramList.scale.value * paramList.xzscale.value, 0,
    0, 0, 0, 1
  ], mMat);
  mMat = Matrix.mul([ // xrot
    1, 0, 0, 0,
    0, Math.cos(paramList.xrot.value * DEG), -Math.sin(paramList.xrot.value * DEG), 0,
    0, Math.sin(paramList.xrot.value * DEG), Math.cos(paramList.xrot.value * DEG), 0,
    0, 0, 0, 1
  ], mMat);
  mMat = Matrix.mul([ // zrot
    Math.cos(paramList.zrot.value * DEG), Math.sin(paramList.zrot.value * DEG), 0, 0,
    -Math.sin(paramList.zrot.value * DEG), Math.cos(paramList.zrot.value * DEG), 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
  ], mMat);
  mMat = Matrix.mul([ // yrot
    Math.cos(paramList.yrot.value * DEG), 0, -Math.sin(paramList.yrot.value * DEG), 0,
    0, 1, 0, 0,
    Math.sin(paramList.yrot.value * DEG), 0, Math.cos(paramList.yrot.value * DEG), 0,
    0, 0, 0, 1
  ], mMat);
  mMat = Matrix.mul([ // pos
    1, 0, 0, paramList.xpos.value / 16,
    0, 1, 0, paramList.ypos.value / 16 + 0.5,
    0, 0, 1, paramList.zpos.value / 16,
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
  gl.useProgram(itemPrgInfo.prg);
  // VBO
  gl.bindVertexArray(blockVao);
  // テクスチャ
  gl.uniform1i(itemPrgInfo.tex, itemList[nowItemName].number);
  // 変形行列
  gl.uniformMatrix4fv(itemPrgInfo.mvpMat, true, Matrix.mul(vpMat, mMat));
  gl.uniformMatrix4fv(itemPrgInfo.mAdjMat, true, Matrix.t(Matrix.adj(mMat)));
  // ブロックを描画
  gl.drawElements(gl.TRIANGLES, blockVertCount, gl.UNSIGNED_SHORT, 0);


  // 軸
  gl.useProgram(axisPrgInfo.prg);
  // VBO
  gl.bindVertexArray(axisVao);
  // 変形行列
  gl.uniformMatrix4fv(axisPrgInfo.mvpMat, true, vpMat);
  // 軸を描画
  gl.drawArrays(gl.LINES, 0, axisVertCount);
}
