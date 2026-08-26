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
  const s0 = mat[ 0] * mat[ 5] - mat[ 1] * mat[ 4];
  const s1 = mat[ 0] * mat[ 6] - mat[ 2] * mat[ 4];
  const s2 = mat[ 0] * mat[ 7] - mat[ 3] * mat[ 4];
  const s3 = mat[ 1] * mat[ 6] - mat[ 2] * mat[ 5];
  const s4 = mat[ 1] * mat[ 7] - mat[ 3] * mat[ 5];
  const s5 = mat[ 2] * mat[ 7] - mat[ 3] * mat[ 6];

  const c0 = mat[ 8] * mat[13] - mat[ 9] * mat[12];
  const c1 = mat[ 8] * mat[14] - mat[10] * mat[12];
  const c2 = mat[ 8] * mat[15] - mat[11] * mat[12];
  const c3 = mat[ 9] * mat[14] - mat[10] * mat[13];
  const c4 = mat[ 9] * mat[15] - mat[11] * mat[13];
  const c5 = mat[10] * mat[15] - mat[11] * mat[14];

  return [
    mat[ 5] * c5 - mat[ 6] * c4 + mat[ 7] * c3,
  - mat[ 1] * c5 + mat[ 2] * c4 - mat[ 3] * c3,
    mat[13] * s5 - mat[14] * s4 + mat[15] * s3,
  - mat[ 9] * s5 + mat[10] * s4 - mat[11] * s3,
  - mat[ 4] * c5 + mat[ 6] * c2 - mat[ 7] * c1,
    mat[ 0] * c5 - mat[ 2] * c2 + mat[ 3] * c1,
  - mat[12] * s5 + mat[14] * s2 - mat[15] * s1,
    mat[ 8] * s5 - mat[10] * s2 + mat[11] * s1,
    mat[ 4] * c4 - mat[ 5] * c2 + mat[ 7] * c0,
  - mat[ 0] * c4 + mat[ 1] * c2 - mat[ 3] * c0,
    mat[12] * s4 - mat[13] * s2 + mat[15] * s0,
  - mat[ 8] * s4 + mat[ 9] * s2 - mat[11] * s0,
  - mat[ 4] * c3 + mat[ 5] * c1 - mat[ 6] * c0,
    mat[ 0] * c3 - mat[ 1] * c1 + mat[ 2] * c0,
  - mat[12] * s3 + mat[13] * s1 - mat[14] * s0,
    mat[ 8] * s3 - mat[ 9] * s1 + mat[10] * s0
  ];
}