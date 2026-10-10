# Joint residual encoding: a guarantee above `2^-34`

Ryan Shea — October 10, 2026.

**Proposed refinement with a written proof and same-agent verification.
Independent review and formalization are pending. The earlier published
`2^-36` paper is preserved at commit `669e97c`.** The proposed improvement is a joint count for its two residual
pivot tests, followed by a density-sample cutoff used only in the analysis.

## 1. Statement and dependencies

Retain the algorithm, full-seed adversary, and hypotheses of the
[consolidated proof](../manuscript.md) and
[published paper](https://github.com/shea256/matroid-prophet-inequality/blob/669e97c863aa7863c93258a5a1e2c6d9165b2d2b/manuscript.md).
In particular, the matroid is any known finite labeled matroid; there is one
independent sample per element, matching its independent nonnegative value
law; the algorithm is distribution independent; and the arrival permutation
may depend on every sample, value, and initial seed bit. Assume finite expected
offline optimum. Choices are irrevocable and feasible at every prefix.

Choose

```math
\kappa=640,\quad \rho=7/16,\quad h=3/4,\quad t=2^{-15},\quad
p_{\rm main}=1-t,\quad \theta=261/256,\quad L=256,\quad B=\theta^L.
```

The density rate is `rho`, the filter rate is `h`, and both guard and test
rates are `t`. Choose one of `L` rational rounding phases uniformly. Keep
the source maximum branch and fair parity. The resulting written bound is

```math
\mathbb E[\mathrm{reward}]\ge C_1\mathbb E[\mathrm{OPT}],\qquad
C_1=\frac{14995972860899}{244123247301151948800000}
>\frac{21}{20}\,2^{-34}>2^{-34}.
```

This coefficient exceeds four times the compact published certificate
`C_0=9652683394380719/637507023635152349901619200`. The random seed uses
`37n+24` independent fair bits: `2+4+15+15+1` per element for filter, density,
guard, test, and maximum masks, plus `8+15+1` for phase, branch, and parity.

The structural source is OpenAI/math revision
`fd4aeeb2ee4fc729c18d98444fed42fd0529eeeb`, unchanged in the current audit.
This proof uses the density generators and residual encoding in
[the source transfer section](https://github.com/openai/math/blob/fd4aeeb2ee4fc729c18d98444fed42fd0529eeeb/preprints/One-Sample-Suffices-for-Matroid-Prophet-Inequalities-against-an-Almighty-Adversary-September-23-2026/build/sections/transfer.tex).
It retains the published quadratic hazard, safety comparison, test thinning,
rank telescope, weighted accounting, and lossless one-sample simulation.
The new deductions below replace the residual-family count and its error.
They do not establish an exhaustive priority claim or independent review.

## 2. Couple the two pivot descriptions

Use exactly the source conditioning: fix the filter `H`, the parity, and
all density, guard, and test bits outside one true group `U` of size `n`.
The incoming path `F(k)`, competition sets `K_b`, index `h_group`, and
activation time `a=-3h_group` are then fixed. Do not condition on listing
or on any focal mask. Write `S_d(N)=sum_{j=0}^d binom(N,j)`.

Suppose the focal nominal path has a density generator set `J` and rank
witness union `Z`, each of size at most an integer `q`. A generator `g` has
an insertion time `tau(g)` in `[a,0]` and

```math
X(k)=\operatorname{cl}\bigl(F(k)\cup\{g\in J:\tau(g)\le k\}\bigr).
```

Witnesses `Z_b` are disjoint and lie in `X(b)` at valid endpoints `b` of the
chosen parity, with `a+2<=b<=0`. The source represents the residual by two
marked-pivot tests on `U`:

1. List `F(k)` at each integer time, then generators inserted at that time.
   Mark the whole block one exactly at valid endpoints. The pivot marks
   select labels with valid nominal birth.
2. At each parity endpoint `b`, insert `K_b` and witnesses `Z_b` with mark
   zero, then `F(b)` and generators with `b-2<tau(g)<=b` with mark one.
   Start with the fixed `F(b0)`, marked zero, where `b0` is the chosen-parity
   member of `{a-2,a-1}`. End at the member of `{0,1}` of that parity.

Set `K_b=Z_b=empty` at nonvalid endpoints. The second sequence's endpoint
span is `X(b)` and its intermediate span is `cl(X(b-2) union K_b union Z_b)`.
For a label passing the first test, its second pivot is in that same layer.
It gets mark one precisely if it belongs to the residual. Hence the
intersection of the two mark-one sets is the residual, as in the source.

### Joint counting lemma

For each fixed pair `J,Z`, of sizes `j,z`, the number of residuals obtainable
from these two linked sequences is at most

```math
3^j\,4^{2j+z}\,S_{j+z}(2n). \tag{J}
```

The source marked-pivot proof supplies the following preliminary fact. An
old occurrence sequence spanning the matroid, with `s` specified movable
occurrences inserted, admits at most `4^s` retained greedy bases of occurrences.
Indeed old-only greedy reduces the old sequence to a basis. For that basis,
only at most `s` old positions can be omitted, since their conditional-rank
drops for the fixed movable labels sum to at most `s`. There are at most
`2^s` omitted-old choices and `2^s` retained-movable choices. This statement
does not depend on insertion positions, marks, or representability.

Apply it with `s=j` to the first sequence and `s=j+z` to the second.
There are at most `4^(2j+z)` pairs of retained bases. Fix such a pair. In a
retained basis of occurrences every nonloop `f` has a unique minimal support
spanning it, by matroid submodularity. Its pivot is the last support member.

We now represent **both** pivot tests using the same `j+z` real variables,
rather than using separate variables for the shared generators. This is the
new dimension saving. Let the entire ground set have size `N`, label it
`0,...,N-1`, put `m=N+1`, `T=8m`, and define `u_k=(k-a+2)T`.
Give old occurrences the following fixed signed scores:

| Occurrence | Absolute score | Sign |
|---|---|---|
| `e` in the first sequence's `F(k)` block | `2^(u_k+4m+e)` | its fixed first-test mark |
| `e` in the second sequence's initial `F(b0)` | `2^(u_b0+4m+e)` | negative |
| `e` in its `K_b` block | `2^(u_b+e)` | negative |
| `e` in its `F(b)` block | `2^(u_b+4m+e)` | positive |

A positive sign means mark one. Set one positive variable per generator,
`x_g=2^(u_tau(g)+6m+g)`, and one per witness,
`y_z=2^(u_b+2m+z)` for `z in Z_b`. Its first-sequence generator score is
`eta_g x_g`, where `eta_g` is positive exactly at a valid endpoint.
Its second-sequence score is `d_g x_g`, with `d_g=1` if `tau(g)` has the
chosen parity and `d_g=2^T` otherwise. The latter multiplication moves an
odd-layer insertion to the following endpoint's generator block. A witness
has score `-y_z` in the second sequence and does not occur in the first.

There are only three possible coefficient pairs for a generator:

```math
(\eta_g,d_g)\in\{(1,1),\ (-1,1),\ (-1,2^T)\}.
```

The middle case includes early insertions of the chosen parity that are not
valid births. Thus no early-boundary case is dropped. Fix these types, costing
at most `3^j` choices. Within every block use label order. In the second
generator block, order all generators by label after moving them to the
endpoint; they all have mark one, so this reordering does not change any
pivot mark or endpoint span.

In each sequence the absolute scores are distinct powers of two, in exactly
its occurrence order. Each score exceeds the sum of all preceding scores.
Therefore the sign of the sum over any support is its last member's mark.
For the fixed retained bases and fixed types, these support sums are `2n`
affine functions of the **same** `j+z` variables `x_g,y_z`. Every realized
pair of pivot-mark vectors is a strict sign pattern of these functions.
The affine-hyperplane region bound gives at most `S_(j+z)(2n)` such patterns.
This proves (J). Coefficients depend on the fixed old paths, bases, and types,
not on insertion times within a type. Scores are a counting device only.

Allowing all subset choices of size at most `q` gives a family fixed before
the focal bits with

```math
|\mathfrak R|\le 192^q S_q(n)^2 S_{2q}(2n). \tag{F}
```

For comparison, the previous separate count was
`4^(3q) S_q(n)^3 S_(2q)(n)`: the coefficient of `log(kappa)` in its entropy
was five. The joint count reduces that coefficient to four, with its new
constant factor fully charged.

## 3. Use the density sample's size

Choose an analysis cutoff `rho<r<1`, later `r=33/64`. Put
`q=floor(r n/kappa)`, and call an outcome good when `|D intersect U|<=r n`.
On a good outcome, the density generator lemma gives `|J|<=q`.
If the nominal rank `z<=q`, its rank witnesses also have total size at most
`q`, so (F) contains the residual. If `z>q`, then
`kappa z>r n>=|D intersect U|>=sigma`, so no residual error is needed.

For `alpha=r/kappa`, the elementary binomial-sum bound with floors gives
`log S_q(n)<=alpha n log(e/alpha)` and
`log S_(2q)(2n)<=2 alpha n log(e/alpha)`. It follows that

```math
\log|\mathfrak R|\le A_r n/\kappa,\qquad
A_r=r\bigl(4\log(\kappa/r)+4+6\log2+\log3\bigr). \tag{E}
```

This includes `q=0`, which occurs near the smallest group size. No division
by `q` is used. All family choices are made under the original conditioning,
**without conditioning the product mask law on the good event**.

Define the error `e` as the residual size on listed good outcomes with
`z<=q`, as `n` on bad outcomes, and as zero otherwise. Pointwise,
`sigma<=kappa z+e`: on the bad branch use `sigma<=n`; on a listed good
small-rank branch use the source residual comparison; the other branches
were covered above. The residual is contained in `O=D union C`, whose focal
coordinates independently have probability `p_O=rho+(1-rho)t`.

For real `x>=0`, the good-branch residual tail is at most
`min(1, |Rfamily| exp(-lambda x))`, where `lambda=-log p_O`. This follows by
dropping the good-event intersection and taking a union over the fixed family;
it asserts no independence for the selected residual. Integrating gives
`(A_r n/kappa+1)/lambda`. The independent density mask has the usual
Chernoff bound

```math
\Pr(|D\cap U|>rn)\le e^{-n d(r\Vert\rho)},\quad
d(r\Vert\rho)=r\log\frac r\rho+(1-r)\log\frac{1-r}{1-\rho}.
```

For completeness, apply Markov to `exp(s |D intersect U|)` with
`exp(s)=r(1-rho)/(rho(1-r))>1`. Its moment is
`(1-rho+rho exp(s))^n`; substitution gives this exponent, including noninteger
thresholds. For every `n>=kappa`, combining the two branches with the retained
safety estimate yields

```math
\mathbb E[z_i\mid H]\ge
\frac{\gamma|Y_i|-\epsilon n_i}{\kappa},\qquad
\gamma=\rho/4,\quad
\epsilon=\frac{\rho}{2\kappa}
 +\frac{A_r+1}{\kappa\lambda}+e^{-\kappa d(r\Vert\rho)}. \tag{R}
```

The density cutoff does not alter the algorithm, reveal additional samples,
or impose a favorable-event hypothesis on the final theorem.

## 4. Exact accounting to the final coefficient

With the parameters in Section 1 and `r=33/64`, exact rational logarithm
enclosures certify

```math
A_r+1<41/2,\quad \lambda>413/500,\quad
\kappa d(r\Vert\rho)>11\log2,\quad B>140.
```

The log enclosures use the atanh series with its explicit geometric tail,
after dyadic range reduction. Thus (R) holds with the larger rational error

```math
\bar\epsilon=\frac{7}{32\cdot640}
 +\frac{41/2}{640(413/500)}+\frac1{2048}
 =\frac{335021}{8458240}.
```

All subsequent deductions are the published weighted accounting. Set

```math
\beta=(B-1)/B,\quad
L_0=\bar\epsilon+t\kappa+\frac{t\kappa+\rho}{B-1},\quad
s=(1-h)(\gamma-L_0/h).
```

For rounded optimum `W` and largest rounded nonloop weight `m_*`, the main
branch satisfies `E min_pi reward_main >= beta t s W/kappa - t gamma m_*`.
The maximum branch supplies `m_*/4`. Since `t/4 >= (1-t)t gamma`, their
mixture cancels the negative term. Finite-phase rounding gives a factor
`beta/[L(theta-1)]`, with `L(theta-1)=5`. Therefore

```math
C=\frac{(1-t)\beta^2 t s}{5\kappa}
>\frac{(1-t)(139/140)^2 t}{5\kappa}
 \left[\frac\gamma4-
 \frac{\bar\epsilon+t\kappa+(t\kappa+\rho)/139}{3}\right]=C_1.
```

The bracket is exactly `23047361/3527086080>0`. The
[scalar certificate](../verification/certify_joint_residual.py) verifies all
displayed inequalities and the stated comparison with the published `C_0`.

Every fixed-phase bound has the minimum over arrival permutations **inside**
the seed expectation. The unchanged sample/value simulation is lossless even
when unused samples, sacrificed values, phase, branch, and every seed bit
inform the adversary. No seed-oblivious or fixed-order substitution occurs.
Loops, empty sets, rank zero, zero values, ties, and finite-integrable but
unbounded value laws are handled by the retained source construction.

## 5. Verification scope and resources

The [finite checker](../verification/check_joint_residual.py) constructs actual
source paths on small matroids, extracts generators and rank witnesses, and
compares direct residual membership with both pivot streams and their shared
affine scores using exact integers. It exercises the invalid early births,
both parities, moved generator scores, dependent/parallel labels, and zero
values. A negative control omits the score shift and is required to fail.
It separately checks exact binomial tails and binomial-sum bounds with floors.
These are finite evidence; the universal claim rests on Sections 2–4 and the
explicitly retained source interfaces. Same-agent checking is not independent
mathematical review.

The score variables are not sampled or evaluated by the online algorithm.
The algorithm uses the same rank/closure preprocessing and exact-real model
as the published paper; such tables and flat enumeration can be exponential.
The 256 phase factors are fixed rationals. Exact rational-input costs still
depend on observation bit lengths and group exponents; no polynomial-time
or bounded-precision implementation claim is made.

The main remaining review target is the joint affine representation: the old
scores must be fixed before focal masks, each generator must have one shared
variable, and its two coefficient types must not hide a timeline-dependent
choice. The explicit three-type construction above is intended to discharge
that obligation. The cutoff must also be applied by intersection/union bounds,
not by falsely retaining a product law after conditioning on sample size.
