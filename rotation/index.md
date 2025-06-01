$$
\def\sign{\mathop{\mathrm{sign}}}
\def\iu{\mathrm{i}}
\def\ju{\mathrm{j}}
\def\ku{\mathrm{k}}
$$

# 回転
## 回転
長さと向きを保存する線形変換が回転。

## 座標系
座標軸（左手系・右手系）：右手系

## 回転の軸と方向
正の回転方向（左ねじ・右ねじ）：右ねじ

## 回転の合成
回転の合成方法（絶対回転・相対回転）：絶対回転



# 回転行列
$$
\bm{R} = \begin{bmatrix} r_{11} & r_{12} & r_{13} \\ r_{21} & r_{22} & r_{23} \\ r_{31} & r_{32} & r_{33} \end{bmatrix}
\quad (\bm{R}^\mathsf{T} = \bm{R}^{-1},\ \det \bm{R} = 1)
$$
$ 3\times3 $ 行列で表現する。

## 回転の計算
点 $ \mathrm{P}(x,\ y,\ z) $ に $ \bm{R} $ の回転を作用した点 $ \mathrm{P}'(x',\ y',\ z') $ は、点を $ 1\times3 $ 行列（3次列ベクトル）
$$ \bm{p} = \begin{bmatrix} x \\ y \\ z \end{bmatrix},\ \bm{p}' = \begin{bmatrix} x' \\ y' \\ z' \end{bmatrix} $$
で表して行列の積を用いて
$$ \bm{p}' = \bm{R}\bm{p} $$
と計算できる。成分表示すると
$$ \begin{split}
\begin{bmatrix} x' \\ y' \\ z' \end{bmatrix}
&= \begin{bmatrix} r_{11} & r_{12} & r_{13} \\ r_{21} & r_{22} & r_{23} \\ r_{31} & r_{32} & r_{33} \end{bmatrix} \begin{bmatrix} x \\ y \\ z \end{bmatrix} \\
&= \begin{bmatrix} r_{11}x+r_{12}y+r_{13}z \\ r_{21}x+r_{22}y+r_{23}z \\ r_{31}x+r_{32}y+r_{33}z \end{bmatrix}
\end{split} $$

また、$ \bm{R} $ と $ \bm{R}' $ との合成（$ \bm{R} $ の後に $ \bm{R}' $ を作用する回転）は下式で表される。
$$ \bm{R}'\bm{R} $$
成分表示すると
$$ \begin{split}
&= \begin{bmatrix} r_{11}' & r_{12}' & r_{13}' \\ r_{21}' & r_{22}' & r_{23}' \\ r_{31}' & r_{32}' & r_{33}' \end{bmatrix} \begin{bmatrix} r_{11} & r_{12} & r_{13} \\ r_{21} & r_{22} & r_{23} \\ r_{31} & r_{32} & r_{33} \end{bmatrix} \\
&=\begin{bmatrix} r_{11}'r_{11}+r_{12}'r_{21}+r_{13}'r_{31} & r_{11}'r_{12}+r_{12}'r_{22}+r_{13}'r_{32} & r_{11}'r_{13}+r_{12}'r_{23}+r_{13}'r_{33} \\ r_{21}'r_{11}+r_{22}'r_{21}+r_{23}'r_{31} & r_{21}'r_{12}+r_{22}'r_{22}+r_{23}'r_{32} & r_{21}'r_{13}+r_{22}'r_{23}+r_{23}'r_{33} \\ r_{31}'r_{11}+r_{32}'r_{21}+r_{33}'r_{31} & r_{31}'r_{12}+r_{32}'r_{22}+r_{33}'r_{32} & r_{31}'r_{13}+r_{32}'r_{23}+r_{33}'r_{33} \end{bmatrix}
\end{split} $$

## 拘束条件
行列 $ \bm{R} $ が回転行列であるためには、直交行列（$ \bm{R}^\mathsf{T} = \bm{R}^{-1} $）であり、行列式が1（$ \det \bm{R} = 1 $）でなければならない。

## 回転との対応
回転と1対1対応。1つの回転につき、回転行列は1つしかない。

## 列ベクトル表示
列ベクトル表示する
$$
\bm{r}_1 = \begin{bmatrix} r_{11} \\ r_{21} \\ r_{31} \end{bmatrix},\ 
\bm{r}_2 = \begin{bmatrix} r_{12} \\ r_{22} \\ r_{32} \end{bmatrix},\ 
\bm{r}_3 = \begin{bmatrix} r_{13} \\ r_{23} \\ r_{33} \end{bmatrix}
$$
$$ \bm{R} = \begin{bmatrix} \bm{r}_1 & \bm{r}_2 & \bm{r}_3 \end{bmatrix} $$
$ \bm{r}_1,\ \bm{r}_2,\ \bm{r}_3 $ はそれぞれ点 $ (1,\ 0,\ 0),\ (0,\ 1,\ 0),\ (0,\ 0,\ 1) $ の回転後の位置。
また、以下が成り立つ。
$$ \begin{gathered}
\left|\bm{r}_1\right| = \left|\bm{r}_2\right| = \left|\bm{r}_3\right| = 1,\\
\bm{r}_1 \cdot \bm{r}_2 = \bm{r}_2 \cdot \bm{r}_3 = \bm{r}_3 \cdot \bm{r}_1 = 0,\\
\bm{r}_1 \times \bm{r}_2 = \bm{r}_3,\ 
\bm{r}_2 \times \bm{r}_3 = \bm{r}_1,\ 
\bm{r}_3 \times \bm{r}_1 = \bm{r}_2
\end{gathered} $$



# 軸角
$$
\bm{n} = \begin{bmatrix} n_x \\ n_y \\ n_z \end{bmatrix},\ \theta
\quad (\left|\bm{n}\right| = 1,\ 0 \le \theta \le \pi)
$$
回転軸の方向 $ \bm{n} $ と回転する角度 $ \theta $ との組で表す。

## オイラーの回転定理


## 軸角→回転行列
$$
\bm{R} = \begin{bmatrix} n_x^2(1-\cos\theta)+\cos\theta & n_xn_y(1-\cos\theta)-n_z\sin\theta & n_xn_z(1-\cos\theta)+n_y\sin\theta \\ n_xn_y(1-\cos\theta)+n_z\sin\theta & n_y^2(1-\cos\theta)+\cos\theta & n_yn_z(1-\cos\theta)-n_x\sin\theta \\ n_xn_z(1-\cos\theta)-n_y\sin\theta & n_yn_z(1-\cos\theta)+n_x\sin\theta & n_z^2(1-\cos\theta)+\cos\theta \end{bmatrix}
$$
他の表現方法
$$ \begin{split}
&= \exp(\theta\bm{n}^\wedge) \\
&= \bm{I}+\bm{n}^\wedge\sin\theta+(\bm{n}^\wedge)^2(1-\cos\theta) \\
&= \bm{n}\bm{n}^\mathsf{T}(1-\cos\theta)+\bm{I}\cos\theta+\bm{n}^\wedge\sin\theta
\end{split} $$

## 回転行列→軸角
<!-- $$ \begin{split}
r_{11} &= n_x^2(1-\cos\theta)+\cos\theta \\
r_{12} &= n_xn_y(1-\cos\theta)-n_z\sin\theta \\
r_{13} &= n_xn_z(1-\cos\theta)+n_y\sin\theta \\
r_{21} &= n_xn_y(1-\cos\theta)+n_z\sin\theta \\
r_{22} &= n_y^2(1-\cos\theta)+\cos\theta \\
r_{23} &= n_yn_z(1-\cos\theta)-n_x\sin\theta \\
r_{31} &= n_xn_z(1-\cos\theta)-n_y\sin\theta \\
r_{32} &= n_yn_z(1-\cos\theta)+n_x\sin\theta \\
r_{33} &= n_z^2(1-\cos\theta)+\cos\theta \\
\\
r_{11}-1 &= (n_x^2-1)(1-\cos\theta) \\
r_{22}-1 &= (n_y^2-1)(1-\cos\theta) \\
r_{33}-1 &= (n_z^2-1)(1-\cos\theta) \\
\\
\theta &= \arccos\frac{r_{11}+r_{22}+r_{33}-1}{2} \\
2\sin\theta &= \sqrt{4-(r_{11}+r_{22}+r_{33}-1)^2}
\end{split} $$

--- -->


$$
\theta = \arccos\frac{r_{11}+r_{22}+r_{33}-1}{2}
$$

$ \theta = 0\ (r_{11}+r_{22}+r_{33} = 3) $ のとき：
$$
\bm{n} = \begin{bmatrix} 1 \\ 0 \\ 0 \end{bmatrix},\ \theta = 0
$$

$ 0 < \theta < \pi\ (-1 < r_{11}+r_{22}+r_{33} < 3) $ のとき：
$$
\bm{n} = \frac{1}{\sqrt{4-(r_{11}+r_{22}+r_{33}-1)^2}}\begin{bmatrix} r_{32}-r_{23} \\ r_{13}-r_{31} \\ r_{21}-r_{12} \end{bmatrix},\ 
\theta = \arccos\frac{r_{11}+r_{22}+r_{33}-1}{2}
$$

$ \theta = \pi\ (r_{11}+r_{22}+r_{33} = -1) $ のとき：
$$
\begin{split}
\left|n_x\right| &= \sqrt{\frac{r_{11}+1}{2}}, \\
\left|n_y\right| &= \sqrt{\frac{r_{22}+1}{2}}, \\
\left|n_z\right| &= \sqrt{\frac{r_{33}+1}{2}}
\end{split}
$$
これらのうち最大のもの $ \left|k\right| $ に対し $ k = \left|k\right| $ とする。
$$
\begin{split}
\sign(n_x) \sign(n_y) &= \sign(r_{12}), \\
\sign(n_y) \sign(n_z) &= \sign(r_{23}), \\
\sign(n_x) \sign(n_z) &= \sign(r_{31})
\end{split}
$$
これらのうち $ \sign(k) $ を含む2式を取り出す。$ \sign(k) = 1 $ なので他2変数の符号が決定できる。


# 回転ベクトル
$$
\bm{v} = \begin{bmatrix} v_x \\ v_y \\ v_z \end{bmatrix}
\quad (0 \le \left|\bm{v}\right| \le \pi)
$$
方向が回転軸の方向で、大きさが回転する角度であるベクトルで表す。

## 軸角→回転ベクトル
$$ \bm{v} = \theta\bm{n} = \begin{bmatrix} \theta n_x \\ \theta n_y \\ \theta n_z \end{bmatrix} $$

## 回転ベクトル→軸角
$$ \theta = \left|\bm{v}\right|,\ \bm{n} = \frac{\bm{v}}{\left|\bm{v}\right|}$$

## 回転ベクトル→回転行列

## 回転行列→回転ベクトル



# オイラー角
$$
\theta_1,\ \theta_2,\ \theta_3
\quad (0 \le \theta_1,\ \theta_2,\ \theta_3 < 2\pi)
$$
座標軸に沿った3回の回転の角度で表す。

## オイラー角→回転行列

## 回転行列→オイラー角

- オイラー角→軸角
- 軸角→オイラー角
- オイラー角→回転ベクトル
- 回転ベクトル→オイラー角



# クォータニオン
$$
q = a+b\iu+c\ju+d\ku
\quad (\left|q\right| = 1)
$$
四元数で表す。

四元数（クォータニオン）は複素数を拡張したもの。$ a,\ b,\ c,\ d $ は実数で $ \iu,\ \ju,\ \ku $ は虚数単位。
- 加法が可換 （$ q_1+q_2 = q_2+q_1 $）
- 乗法が加法に対して分配的（$ q(q_1+q_2) = qq_1+qq_2,\ (q_1+q_2)q = q_1q+q_2q $）
- 乗法が非可換（一般に $ q_1q_2 \ne q_2q_1 $）
- 実数と四元数の乗法なら可換（$ a_1q_2 = q_2a_1 $）
- $ \iu^2 = \ju^2 = \ku^2 = -1,\ \iu\ju = -\ju\iu = \ku,\ \ju\ku = -\ku\ju = \iu,\ \ku\iu = -\iu\ku = \ju $

## 軸角→クォータニオン
$$
q = \cos\frac{\theta}{2}+(n_x\iu+n_y\ju+n_z\ju)\sin\frac{\theta}{2}
$$

## クォータニオン→軸角
$$
\bm{n} = \frac{1}{\sqrt{1-a^2}} \begin{bmatrix} b \\ c \\ d \end{bmatrix},\ 
\theta = 2\arccos a
$$

## 回転ベクトル→クォータニオン
$$
q = \cos\frac{\left|\bm{v}\right|}{2}+\frac{v_x\iu+v_y\ju+v_z\ju}{\left|\bm{v}\right|}\cdot\sin\frac{\left|\bm{v}\right|}{2}
$$
$$
= \exp\left(\frac{v_x\iu+v_y\ju+v_z\ju}{2}\right)
$$

## クォータニオン→回転ベクトル

## クォータニオン→回転行列
$$
\bm{R} = \begin{bmatrix} 2a^2+2b^2-1 & -2ad+2bc & 2ac+2bd \\ 2ad+2bc & 2a^2+2c^2-1 & -2ab+2cd \\ -2ac+2bd & 2ab+2cd & 2a^2+2d^2-1 \end{bmatrix}
$$

## 回転行列→クォータニオン
$$ \begin{split}
\left|a\right| &= \frac{\sqrt{1+r_{11}+r_{22}+r_{33}}}{2},\\
\left|b\right| &= \frac{\sqrt{1+r_{11}-r_{22}-r_{33}}}{2},\\
\left|c\right| &= \frac{\sqrt{1-r_{11}+r_{22}-r_{33}}}{2},\\
\left|d\right| &= \frac{\sqrt{1-r_{11}-r_{22}+r_{33}}}{2}
\end{split} $$
これらのうち最大のもの $ \left|k\right| $ に対し $ k = \left|k\right| $ とする。
$$ \begin{split}
\sign(a)\sign(b) &= \sign(r_{32}-r_{23}),\\
\sign(a)\sign(c) &= \sign(r_{13}-r_{31}),\\
\sign(a)\sign(d) &= \sign(r_{21}-r_{12}),\\
\sign(c)\sign(d) &= \sign(r_{32}+r_{23}),\\
\sign(b)\sign(d) &= \sign(r_{13}+r_{31}),\\
\sign(b)\sign(c) &= \sign(r_{21}+r_{12})
\end{split} $$
これらのうち $ \sign(k) $ を含む3式を取り出す。$ \sign(k) = 1 $ なので他3変数の符号が決定できる。

例えば、$ \left|a\right|,\ \left|b\right|,\ \left|c\right|,\ \left|d\right| $ のうち $ \left|a\right| $ が最大なら、$ a = \left|a\right| $ とする。$ \sign(a) $ を含む3式より、
$$
\begin{split}
\sign(b) &= \sign(r_{32}-r_{23}),\\
\sign(c) &= \sign(r_{13}-r_{31}),\\
\sign(d) &= \sign(r_{21}-r_{12})
\end{split}
$$
であるから
$$
\begin{split}
a &= \frac{\sqrt{1+r_{11}+r_{22}+r_{33}}}{2},\\
b &= \sign(r_{32}-r_{23}) \frac{\sqrt{1+r_{11}-r_{22}-r_{33}}}{2},\\
c &= \sign(r_{13}-r_{31}) \frac{\sqrt{1-r_{11}+r_{22}-r_{33}}}{2},\\
d &= \sign(r_{21}-r_{12}) \frac{\sqrt{1-r_{11}-r_{22}+r_{33}}}{2}
\end{split}
$$
が求まる。

## オイラー角→クォータニオン
## クォータニオン→オイラー角


# 参考
- 3DCGにおける回転の計算手法の整理 - Qiita  
https://qiita.com/sakana_hug/items/c382e7bc7abb58749af2
- 回転ベクトル・回転行列・クォータニオン・オイラー角についてまとめてみた - かみのメモ  
https://kamino.hatenablog.com/entry/rotation_expressions
- 回転(ロール・ピッチ・ヨー、オイラー、クォータニオン)にまつわる数式、損失関数を全展開で総整理 (Unity & Maximaコード付き) - Qiita  
https://qiita.com/harmegiddo/items/96004f7c8eafbb8a45d0
- 回転行列、クォータニオン(四元数)、オイラー角の相互変換 - Qiita  
https://qiita.com/aa_debdeb/items/3d02e28fb9ebfa357eaf
- オイラー角について – EL-EMENT blog  
https://el-ement.com/blog/2018/05/19/euler-angles/
- Euler angles - Wikipedia  
https://en.m.wikipedia.org/wiki/Euler_angles
- 回転行列（方向余弦行列）とは？定義・性質・３つの物理的な意味・公式のまとめ | スカイ技術研究所ブログ  
https://www.sky-engin.jp/blog/rotation-matrix/