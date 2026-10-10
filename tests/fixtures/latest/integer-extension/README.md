# A stronger conditional bound with a linear precision guard

Building on [Swapnil Jain's round-six construction](https://github.com/Swapnil-jain/integer-mult-kappa/tree/f2176bc1124821bf17eb63725bd366d7bdc020a3), this proposed extension gives

$$
T(n)=O\!\left(n(\log n)^{1-\kappa}\right),\qquad
\kappa=\frac{36942}{10^9}=0.000036942>2^{-15}.
$$

This exponent saving is **0.7537% larger** than that repository's witness
`3666565558019/10^17`. The more substantial change concerns overhead:

- An exact **linear guard**, `Delta = 128(d+1)`, replaces the conservative guard exponent `14694`.
- Coefficient precision becomes **`p = 768 b^3`**, where `b = ceil(log2 n)`, instead of a choice proportional to `b^14696`.
- The complex network uses **14,570,080 roles**, down from 207,387,136: **14.23 times fewer complex roles**. The bit network still has 148,225,616 roles.
- A second parameter choice still beats the comparator while increasing the axis-width exponent about **191 times** and allowing much more arithmetic slack.

These are **conditional, unreviewed mathematical improvements**. They assume the linked construction's phase transfer, bit-frame compiler, batching, Gaussian inverse, layout, prime-selection and original theorem interfaces. They are not a multiplication implementation, a benchmark, or evidence of practical acceleration. The complete algorithm remains galactic.

## Two certified choices

Both use the new bit saving `a_b = 36943733/10^12`, the smaller complex network's
`a_c = 9912567/250000000000`, `beta = 1/16`, and cubic precision with an explicit digit prefactor.

| | Higher saving | Lower overhead |
|---|---:|---:|
| Exponent saving kappa | 0.000036942 | 0.00003668 |
| Improvement over linked witness | 0.7537% | 0.03912% |
| epsilon | 0.99996 | 0.993 |
| Axis-width power `1-epsilon` | 0.00004 | 0.007 |
| Arithmetic allowance delta | 0.000001 | 0.002 |
| Each strict exponent gap | `10^-11` | `10^-9` |

The comparator uses `1-epsilon ≈ 0.0000366657`, arithmetic allowance about
`6.8e-27`, and strict exponent gaps `10^-16`. Bigger allowances reduce some
asymptotic thresholds; these comparisons do not establish an end-to-end crossover.
For example, even reaching 256 active axes remains an enormous input-size requirement.

## What changed

**Bit circuit.** Replace prefix/suffix omitted-sum calculations with recursive
paired trees, then reassociate 368 sums using exactly equal source supports.
All positive sums and frame subspaces remain valid. The role count stays 40,077
per invocation; the recursive child widths improve. An exact rational moment
certificate establishes the new bit saving. No optimality is claimed.

**Precision proof.** A completed recursive phase transform has a known exact
denominator, regardless of its internal operation count. Only one descendant
is active at a time. Telescoping the common phase frames bounds every paused
parent prefix, giving a maximum-over-children guard recurrence rather than
adding the internal precision needs of completed siblings. The proof uses exact
arithmetic; it introduces no numerical rounding.

**Smaller complex circuit.** Use the inherited producer at `h=16` instead of
`h=24`. Its exact moment still exceeds the new bit saving. Every binary frame
and residual is checked at the chosen size.

## Proof and reproducibility

- [Standalone proof note](notes/complex-reuse-note.tex), including both assembly choices.
- [Exact certificate and finite-check results](certificates/latest.json).
- [Reproduction driver](research/verify.py).
- [Pinned-source provenance](research/upstream-manifest.json) and [upstream attribution](research/UPSTREAM-NOTICE).

With Python 3.10 or newer, run from this repository:

```sh
python3 research/verify.py
```

Only the standard library is required. The needed upstream files are included
unchanged and checked against a SHA-256 manifest. The verifier recomputes:

- all 2,047 small omitted-sum zero patterns, all 36,512 active bit-source nodes,
  5,313 side outputs, 23 retained totals, 40,077 slot chains, and 1,970 local ranks;
- all 313,600 complex matrix coefficients and all 33,956 frame/residual checks;
- a complete smaller two-stage scalar network, restoring 100,912 arbitrary scratch values;
- both exact moments, scalar-prefix bounds, guard inequalities and assembly margins;
- nine unit tests, including negative controls and source integrity checks.

These finite checks support the new arguments. They are not a formal proof or
independent review of the complete multiplication algorithm. The inherited
bit common-basis theorem and other global interfaces remain assumptions.

## Earlier work and attribution

The ongoing [search toward `kappa > 2^-10`](research/exploration/README.md) has
not reached that target. It includes exact obstructions for the current network
family, rejected finite candidates, an attributed audit of a newer public bit
network, and a new source-role borrowing wrapper. Exact finite replays and
assembly checks support a **conditional candidate kappa=0.00005487** using
that credited producer, or **kappa=0.0000389** with precision
`768 ceil(b^(43/20))`. The wrapper removes about 6.15% of the pinned producer's
bit-network roles. The global interfaces remain inherited, and these research
files do not replace the main certificate above or establish practical timing.

The earlier `kappa = 59/10^11` rectangle extension is preserved in
[its archived note](notes/archive/complex-rectangles-note.tex),
[its summary](notes/archive/rectangles-README.md), and the existing
[manuscript patch](patches/complex-rectangles-31.patch). That patch represents the
earlier result; it does **not** implement this new extension. The new result is
specified by the proof note and reproducible research bundle above.

This work builds on Swapnil Jain's round-six construction, Douglas Colkitt's
compact controls, OpenAI's pinned manuscript, and the prior contributors named
in [NOTICE](NOTICE) and [research/UPSTREAM-NOTICE](research/UPSTREAM-NOTICE),
including Aurel Prosz's two-stage transfer and the copied-centre/full-batching work.
The new arguments, implementation and checks were prepared with OpenAI Codex
at the repository owner's request. AI cross-checks are not independent review.
No claim of priority over unreviewed or contemporaneous work is made.
