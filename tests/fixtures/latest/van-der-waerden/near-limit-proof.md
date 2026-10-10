# An explicit coefficient 1/193 in the retained parameter region

This is a conditional refinement of the sufficient-region proposition in `research-note.tex`,
with the same upstream geometric, counting, and probability dependencies.
It proposes

```math
W_r(k)>k^{(1/193)k\lfloor\log_2 r\rfloor}
```

for sufficiently large k, with the threshold independent of r. Compared
with the source's coefficient 1/100000, the coefficient ratio is exactly
100000/193, approximately 518.13. The earlier ratio 500 is retained as a
separate parameter choice. No explicit finite threshold is obtained.

Choose

```math
a=1/4,\quad m=4/5,\quad b=2499/10000,\quad
\delta=1/3,\quad\gamma=83/1000,\quad c=1/193.
```

The sufficient region proved in the existing note requires a,b,c>0,
3a<m<1, b<a, 3a<1−b, 0<delta<1,
gamma≤delta/4, gamma<(1−delta)/8, and 2c<gamma b/2.
Every inequality is strict for this choice, including the optional
strictness at gamma≤delta/4. The decisive exact margins are:

| Inequality | Positive margin |
|---|---:|
| m>3a | 1/20 |
| m<1 | 1/5 |
| b<a | 1/10000 |
| 3a<1−b | 1/10000 |
| gamma<delta/4 | 1/3000 |
| gamma<(1−delta)/8 | 1/3000 |
| 2c<gamma b/2 | 31481/3860000000 |

The last entry is computed as

```math
\frac{83}{1000}\frac{2499}{10000}\frac12-\frac2{193}
=\frac{31481}{3860000000}>0.
```

The other audited margins are positive as well. In particular the global
entropy is dominated by M=k^m, the affine progression entropy has strict
power gaps 1/10000, and the rich-event exponent has a negative leading
coefficient. Fixed logarithmic factors are absorbed by those strict gaps
as k grows. Thus the existing transfer argument applies without a change
to its geometric or probability lemmas. Small margins can greatly increase
the required threshold; no runtime or finite coloring improvement follows.

`parameters.json` stores this fourth proposal and `audit_math.py` verifies
all its margins with exact fractions, along with rejection controls at
the affine, entropy, and rich-event boundaries. The saved output is in
`experiments/exact-audit.json`.

The limiting coefficient 1/192 is not included: the region requires
gamma b/4>c and only approaches 1/192. This explicit choice remains below
that supremum. The original source and attribution are linked in the README.
This is a research draft, conditional on the imported source arguments.
