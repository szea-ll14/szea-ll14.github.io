// 数値を文字列化：指数表記ではなく整数・小数で
function toPlaneDecimal(num) {
  // 実数以外は思考放棄
  if (!Number.isFinite(num)) return "";
  // 文字列化
  const strRaw = String(num);
  // 指数表記じゃないならそのまま返す
  if (!strRaw.includes("e")) return String(num)

  // 符号・仮数整数部・仮数小数部・指数に分解
  let [, sgn, manInt, manFrac, exp] = strRaw.match(
    /^(-?)(\d*)\.?(\d*)e([+-]\d+)$/
  );
  exp = Number(exp);

  if (exp > 0) { // e+
    manFrac = manFrac.padEnd(exp, "0");
    manInt = manInt + manFrac.slice(0, exp);
    manFrac = manFrac.slice(exp);
  } else if (exp < 0) { // e-
    manInt = manInt.padStart(1 - exp, "0");
    manFrac = manInt.slice(0 + exp) + manFrac;
    manInt = manInt.slice(0, 0 + exp);
  }

  // 小数点が要れば付けて返す
  return sgn + manInt + (manFrac ? "." + manFrac : "");
}