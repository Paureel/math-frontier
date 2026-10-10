# A sharpened sufficient region: every coefficient below 1/24, explicit 1/25

This is a conditional refinement of the sufficient-region proposition in
`research-note.tex` and of the explicit choice in `near-limit-proof.md`.
It keeps the upstream geometric, counting, and probability dependencies,
and changes three fixed choices inside the source argument. It proposes

```math
W_r(k)>k^{(1/25)k\lfloor\log_2 r\rfloor}
```

for sufficiently large k, with the threshold independent of r. Compared
with the source's coefficient 1/100000, the ratio is exactly 4000.
Compared with the previous explicit choice 1/193 the ratio is 193/25,
about 7.72. Every fixed c below 1/24 is admitted by the same region, and
1/24 is the supremum of this region, not a claimed value. No explicit
finite threshold is obtained; small margins make the threshold large.

## Why the old region stopped at 1/192

The retained region of `research-note.tex` has three binding inequalities:

* `2c < gamma*b/2` (rich progressions need `gamma k/2` distinct flips),
* `gamma < min(delta/4, (1-delta)/8)` (one quarter of each outer bit),
* `b < a` and `3a < 1-b` (affine signature entropy below `pk = k^{1-b}`).

The second caps `gamma` at 1/12 and the third caps `b` at 1/4, so
`c < gamma*b/4 < 1/192`. Neither cap is forced by the geometry. The
quarter comes from the balance demanded of the outer coloring; the
exponent `3a` comes from the choice `h_0 = D^2` for the short-period
cutoff, which sets `log lambda <= D^2 log(2M)` and
`log T_glob = O(D^3 log k)`.

## Three changes

Write, as before, `D = ceil(k^a)`, `M = ceil(k^m)`, `p = k^{-b}`,
`H = k^{-2}`, and let `q` be the least power of the prime `P` in
`(k, 2k^2]` that is at least `k^{ck/D}`. Fix in addition
`0 < eps < 1/2`, `0 < eps_reg <= 1/2`, and `0 < delta`.

**Change 1 (shorter dilation).** Put

```math
h_0 = D\lceil\log k\rceil^2,\qquad \eta=\frac{\epsilon_{\rm reg}}{8D},
```

and keep the source's dilation `lambda`, the product of the full
`l`-primary parts of every period at most `2M` over primes `l <= h_0`.
The dilation lemma is unchanged: `log lambda <= h_0 log(2M)` and every
scalar denominator `s = h/gcd(h, lambda t)` is 1 or exceeds `h_0`.
Hence

```math
\log T_{\rm glob}=O\bigl(D(\log k+\log\lambda)\bigr)=O(k^{2a}\log^3k).
```

The short-period case needs only `h | lambda` for `h <= h_0`, which
holds. The long-period case needs the nonregular fraction bound
`D(4 eta + 1/h_0) <= eps_reg`, which holds for large k because
`4 D eta = eps_reg/2` and `D/h_0 = 1/ceil(log k)^2`. The anchored
pattern count becomes `(C D h)^{6D}` with `C` depending on `eps_reg`
only, since the truncated-mesh breakpoint count is
`16/eta + 4 <= (128/eps_reg + 4) D`. The second local-lemma family
needs `6 D log(C D h)/h` small for `h > h_0`, which holds because
`6 D log(C D h_0)/h_0 = 6 log(C D^2 log^2 k)/log^2 k -> 0`.
Finally `h_0 < 2M < k` needs `a < m < 1`.

**Change 2 (sharper balance).** Replace "each bit occurs on at least
one quarter of the tested positions" by "each bit occurs on at least a
`(1/2 - eps)` fraction of the tested positions". For `l` independent
uniform bits with `X` ones, the source's moment generating function
bound `E exp(s(X - l/2)) <= exp(s^2 l/8)` with `s = 4 eps` gives

```math
\Pr\bigl(|X-l/2|\ge \epsilon l\bigr)\le 2e^{-2\epsilon^2 l}.
```

Give an event testing `l` labels the weight `z = exp(-eps^2 l)`. The
total weight incident to one label is, for the first family,
`k T_glob exp(-eps^2(delta M - 1)) -> 0` because `2a < m`, and for the
second family `sum_{h > h_0} (C D h)^{6D} exp(-eps^2 h/2) -> 0` by the
estimate above. So the incident weight is at most `eps^2/4` for large
k, and the local-lemma criterion reads

```math
\exp\!\bigl[-(\epsilon^2+2\cdot\epsilon^2/4)\,l\bigr]\ \ge\ 2e^{-2\epsilon^2 l},
```

which holds once `l >= 2 log 2 / eps^2`. Tested sizes satisfy
`l >= delta M - 1` or `l >= h/2 > h_0/2`, both unbounded.

**Change 3 (balance the light positions outside heavy blocks).** For a
progression word, fix the heavy label of smallest first occurrence,
and let `h` be its closest-return gap. Partition the indices into full
blocks of length `h` and a remainder of fewer than `h` indices; call a
full block eligible when it contains a heavy index. Let `S` be the set
of light positions outside the eligible blocks. All of `h`, the
blocks, eligibility, and `S` are functions of the word alone (`t`
depends on the step, but only the second family uses `t`). When there
is no heavy label, `S` is the whole progression. When `|S| >= delta k`,
form rows of `S` exactly as in the source's first family (group equal
labels, deal cyclically into `w_max <= k/M` rows, each of size at
least `delta M - 1` with pairwise distinct labels) and demand
`(1/2 - eps)`-balance on each row.

## The new dichotomy constant

Fix a progression that is not affine, so either there is no heavy label
or `h_0 < h <= 2M`. Let `E` be the set of positions in eligible blocks.
A full block that is not eligible consists of light positions, so every
position outside `E` is in `S` or in the remainder:
`k - |E| <= |S| + h`.

* Each eligible block is eligible in the sense of the source
  (verified exactly as before: distinct labels, `|u_i| <= H_x`,
  `|v_i| <= H`, stationary drift bounded by the interval width), has at
  least `(1 - eps_reg) h` regular positions, and by Change 2 contributes
  at least `(1/2 - eps)(1 - eps_reg) h` occurrences of each bit.
* If `|S| >= delta k`, Change 3 contributes at least `(1/2 - eps)|S|`
  occurrences of each bit, on positions disjoint from `E`.

Therefore each bit occurs at least

```math
(1/2-\epsilon)(1-\epsilon_{\rm reg})\,(k-h-\delta k)
```

times in every case: when `|S| >= delta k` the two contributions sum to
at least `(1/2-eps)(1-eps_reg)(k-h)`, and when `|S| < delta k` the
eligible blocks alone cover at least `k - h - delta k` positions. Since
`h <= 2M = o(k)`, any

```math
\gamma<(1/2-\epsilon)(1-\epsilon_{\rm reg})(1-\delta)
```

works for sufficiently large k. This replaces the source's
`gamma <= delta/4`, `gamma < (1-delta)/8`.

## The probability estimates

Rich progressions: with the two-point norm-band lemma of
`research-note.tex`, a progression with at least `gamma k` of each
outer color needs at least `gamma k/2` distinct flips, so

```math
R_k\le 2q^{2D}p^{\gamma k/2}
\le\exp\bigl[(2c-\gamma b/2)k\log k+2D\log(2k^2)+\log 2\bigr]=o(1)
```

whenever `2c < gamma b/2`.

Affine progressions: the signature count is

```math
\log\max(1,T_{\rm aff})=O(k^{2a}\log^3k)+6\log q+O(\log k)
=O\bigl((k^{2a}\log^2k+k^{1-a})\log k\bigr)=o(k^{1-b})
```

provided `2a < 1-b` and `b < a`, and then
`A_k <= 2 T_aff (1-p)^{k/2} = exp[-pk/2 + o(pk)] = o(1)`.

The remaining source conditions are unchanged and hold in the region:
`M/k -> 0`, `MH -> 0`, `MH/k -> 0`, `MH/(k eta) -> 0` (exponent
`m + a - 3 < 0`), `2kH < 1`, `4MH/h < 1/2`, `2M/k <= 1/16`, and
`gcd(lambda, q) = 1` since `h_0 < k < P`.

## The sufficient region and its supremum

```math
a,b,c>0,\quad 2a<m<1,\quad b<a,\quad 2a<1-b,
```

```math
0<\epsilon<\tfrac12,\quad 0<\epsilon_{\rm reg}\le\tfrac12,\quad 0<\delta,\quad
\gamma<(\tfrac12-\epsilon)(1-\epsilon_{\rm reg})(1-\delta),\quad 2c<\gamma b/2.
```

From `b < a` and `2a + b < 1` we get `b < 1/3`; from the balance
condition `gamma < 1/2`; hence `c < gamma b/4 < 1/24`. Every fixed
`c < 1/24` is admitted by letting `eps, eps_reg, delta -> 0`,
`b -> 1/3` from below, `a` slightly above `b`, and `m in (2a, 1)`.
The endpoint 1/24 is not asserted; `audit_math.py` rejects it.

## Explicit choice

```math
a=\tfrac{333}{1000},\quad m=\tfrac45,\quad b=\tfrac{331}{1000},\quad
\delta=\epsilon=\epsilon_{\rm reg}=\tfrac1{200},\quad
\gamma=\tfrac{97}{200},\quad c=\tfrac1{25}.
```

| Inequality | Positive margin |
|---|---:|
| m > 2a | 67/500 |
| m < 1 | 1/5 |
| b < a | 1/500 |
| 2a < 1 − b | 3/1000 |
| gamma < (1/2−eps)(1−eps_reg)(1−delta) | 40499/8000000 |
| 2c < gamma b/2 | 107/400000 |

The last entry is

```math
\frac{97}{200}\cdot\frac{331}{1000}\cdot\frac12-\frac{2}{25}
=\frac{32107}{400000}-\frac{32000}{400000}=\frac{107}{400000}>0 .
```

`parameters.json` stores this proposal under `sharpened_proposals`,
and `audit_math.py` verifies every margin with exact fractions, along
with five rejection controls (`b = a`, `b = 1 - 2a`, zero rich
exponent, gamma at the exact balance bound, and `c = 1/24`). The saved
output is in `experiments/exact-audit.json`.

## What is and is not claimed

The three changes touch only fixed numerical choices and the tested
fraction in the outer-coloring local lemma. They do not alter the
source's geometric lemmas, the anchored pattern count, the affinity
lemma, the digit product, or the prime bound. Passing the scripts
establishes the inequalities, not the transfer as a theorem; the
transfer remains conditional on the imported source arguments and on
the two-point norm-band lemma of this repository. No finite coloring,
finite van der Waerden record, or runtime improvement follows. The
original source and attribution are linked in the README.
