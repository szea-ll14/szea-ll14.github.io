// 行列の乗算
export function mul(matL, matR) {
  let rtn = [];
  for (let i = 0; i < 16; i++) {
    rtn[i] = matL[i - i % 4    ] * matR[i % 4     ]
           + matL[i - i % 4 + 1] * matR[i % 4 +  4]
           + matL[i - i % 4 + 2] * matR[i % 4 +  8]
           + matL[i - i % 4 + 3] * matR[i % 4 + 12];
  }
  return rtn;
}
// 転置行列
export function t(mat) {
  return [
    mat[0], mat[4], mat[ 8], mat[12],
    mat[1], mat[5], mat[ 9], mat[13],
    mat[2], mat[6], mat[10], mat[14],
    mat[3], mat[7], mat[11], mat[15],
  ];
}
// 余因子行列
export function adj(mat) {
  const t0 = mat[ 0] * mat[ 5] - mat[ 1] * mat[ 4];
  const t1 = mat[ 0] * mat[ 6] - mat[ 2] * mat[ 4];
  const t2 = mat[ 0] * mat[ 7] - mat[ 3] * mat[ 4];
  const t3 = mat[ 1] * mat[ 6] - mat[ 2] * mat[ 5];
  const t4 = mat[ 1] * mat[ 7] - mat[ 3] * mat[ 5];
  const t5 = mat[ 2] * mat[ 7] - mat[ 3] * mat[ 6];

  const b0 = mat[ 8] * mat[13] - mat[ 9] * mat[12];
  const b1 = mat[ 8] * mat[14] - mat[10] * mat[12];
  const b2 = mat[ 8] * mat[15] - mat[11] * mat[12];
  const b3 = mat[ 9] * mat[14] - mat[10] * mat[13];
  const b4 = mat[ 9] * mat[15] - mat[11] * mat[13];
  const b5 = mat[10] * mat[15] - mat[11] * mat[14];

  return [
    mat[ 5] * b5 - mat[ 6] * b4 + mat[ 7] * b3,
  - mat[ 1] * b5 + mat[ 2] * b4 - mat[ 3] * b3,
    mat[13] * t5 - mat[14] * t4 + mat[15] * t3,
  - mat[ 9] * t5 + mat[10] * t4 - mat[11] * t3,
  - mat[ 4] * b5 + mat[ 6] * b2 - mat[ 7] * b1,
    mat[ 0] * b5 - mat[ 2] * b2 + mat[ 3] * b1,
  - mat[12] * t5 + mat[14] * t2 - mat[15] * t1,
    mat[ 8] * t5 - mat[10] * t2 + mat[11] * t1,
    mat[ 4] * b4 - mat[ 5] * b2 + mat[ 7] * b0,
  - mat[ 0] * b4 + mat[ 1] * b2 - mat[ 3] * b0,
    mat[12] * t4 - mat[13] * t2 + mat[15] * t0,
  - mat[ 8] * t4 + mat[ 9] * t2 - mat[11] * t0,
  - mat[ 4] * b3 + mat[ 5] * b1 - mat[ 6] * b0,
    mat[ 0] * b3 - mat[ 1] * b1 + mat[ 2] * b0,
  - mat[12] * t3 + mat[13] * t1 - mat[14] * t0,
    mat[ 8] * t3 - mat[ 9] * t1 + mat[10] * t0
  ];
}