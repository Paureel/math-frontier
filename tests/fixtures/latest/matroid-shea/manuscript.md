# Joint residual encoding and a guarantee above `2^-34`

**Ryan Shea**

October 10, 2026.

**Written proof with same-agent verification; independent review and
formalization pending.**
This refinement combines the published quadratic exit argument with a joint
encoding of the two residual pivot tests and a density-sample cutoff. It
improves the published certificate by a factor greater than four. The model
and full-seed adversary are unchanged; no priority or confirmed best-known
bound claim is made.

## 1. Statement, construction, and dependencies

For every known finite labeled matroid on `n` elements, the construction below
is a measurable, distribution-independent, one-sample rule using `37n+24`
initial independent fair bits. For mutually independent nonnegative sample
and value coordinates, with matching laws at each label and an independent
seed, assume only that the expected offline optimum is finite. For every
measurable arrival permutation depending on all samples, values, and the
entire seed, the accepted set is independent at every prefix and

```math
 \mathbb E[\mathrm{reward}]\ge C_1\mathbb E[\mathrm{OPT}],\qquad
 C_1=\frac{14995972860899}{244123247301151948800000}
 >\frac{21}{20}2^{-34}>2^{-34}.
```

The exact construction has a slightly larger coefficient; `C_1` uses a
simple rational lower bound on its geometric base. Approximately,
`C_1 = 1.0553229 * 2^-34`.

Use the source's candidate filter, density maps, guarded paths, parity
layers, and online greedy rule, specified below. Choose the parameters

```math
 \kappa=640,\quad t=2^{-15},\quad
 \Pr(H_e)=h=3/4,\quad \Pr(D_e)=\rho=7/16,\quad
 \Pr(C_e)=\Pr(T_e)=t.
```

The maximum branch retains its separate fair mask. Choose the main branch
with probability `p_main=1-t`. For rounding use

```math
 \theta=261/256,\quad L=256,\quad B=\theta^L,
 \quad J\sim\operatorname{Unif}\{0,\ldots,L-1\},
 \quad u_J(x)=\theta^J B^{\lfloor\log_B(x/\theta^J)\rfloor},
 \quad u_J(0)=0.
```

All these random choices are independent and occur in the initial seed.
`B` is rational; integer-valued `B` is unnecessary for the source's
geometric-sum arguments. For a fixed phase its scale `theta^J` factors out.

The primary dependency is OpenAI/math commit
`fd4aeeb2ee4fc729c18d98444fed42fd0529eeeb`, checked on October 10, 2026.
Immutable source links are in [BASELINE.md](BASELINE.md), with hashes in
[the source manifest](verification/source_manifest.json). We retain its
density/generator lemmas, path nesting and prefix feasibility, hybrid safety
comparison, marked-pivot theorem, residual encoding, rank accounting, and
lossless one-sample simulation. Their interfaces are made explicit below.
The sharper residual count is derived in Section 4. The new quadratic exit
proof replaces the source's hazard-band calculation. Attribution and the
scope of the claimed contribution are in [ATTRIBUTION.md](ATTRIBUTION.md).

### 1.1. The fixed-vector rule and analysis quantities

Fix a nonnegative vector `w` before drawing any seed bits. A hidden-vector
rule reveals and sacrifices a seed-chosen set of labels, then handles every
arrival permutation. Its target is the expected minimum reward over all
orders. Let `r(A | P)=r(A union P)-r(P)` and `F_empty=cl(empty)`; fix a total
label order for every tie. Rounded priority compares weight first, then
that label order. Let `W=OPT(u)` and let `I*` be rounded priority greedy on
all labels.

The phase, branch, masks, and parity have the probabilities in the theorem's
construction. In the maximum branch, reveal an independent fair mask and
accept the first unmasked positive nonloop with priority exceeding every
revealed positive nonloop. An empty revealed threshold is below every
positive nonloop. This branch has expected worst-order rounded reward at
least `m*/4`, where `m*` is the largest rounded nonloop weight: the largest
priority is unmasked and the second is masked with probability `1/4`.
With just one positive nonloop the success probability is `1/2`; with none
the claimed lower bound is zero.

In the main branch, reveal and sacrifice `H union D union C`. Define

```math
 U=\{e\notin H:u_e>0,\ e\notin\operatorname{cl}(H_{>e})\},
 \qquad Y=I^*\setminus H.
```

The candidate test uses only revealed `H` values and the arriving value.
For a fixed phase, divide weights by its common scale `theta^J`, so true
groups `U_i` have weight `B^i`. List those intersecting `D`, in increasing
weight order, as `G_1,...,G_m`. Set `D_j=D intersect G_j` and likewise for
`C_j,T_j`. The full groups are analysis objects; their revealed `D_j,C_j`
parts suffice to prepare the rule. If there are no listed groups, reject all.

For a flat `P`, let `Q_j(P)` be the largest flat `Z` containing `P` that
maximizes `|D_j intersect Z|-kappa r(Z)`. For nonflat arguments first take
closure. Put `a_j=-3j`; let `Q_(j,k)=Q_j` for `k>=a_j`, and the identity
earlier. With `F_0(k)=F_empty` for `k<0` and `F_0(k)=E` otherwise, define

```math
 X_j(k)=Q_{j,k}(F_{j-1}(k)),\qquad
 F_j(k)=\operatorname{cl}\bigl(X_j(k)\cup(C_j\cap X_j(k+1))\bigr).
```

Prepare these paths in increasing `j` on the finite relevant auxiliary
timeline, and put `Fhat=F_m`. For an arriving nonloop in listed group `j`,
its nominal birth is `b_j(e)=min{k:e in X_j(k)}`. It is eligible exactly
when it is unsacrificed, passes the candidate test, is in `T`, has birth
`b>=a_j+2` of the chosen parity, and lies outside `Fhat(b-2)`. At each
endpoint `b` maintain the set `A_b` of accepted elements in that layer;
accept an eligible `e` exactly when `r({e} | Fhat(b-2) union A_b)=1`.

The source's density and path lemmas give

```math
 F_{j-1}(k)\subseteq X_j(k)\subseteq F_j(k)\subseteq X_j(k+1),
 \qquad
 |D_j\cap(\operatorname{cl}(Q_j(P)\cup Z)\setminus Q_j(P))|
 \le\kappa r(Z\mid Q_j(P)).
```

Nonloops are born at `a_j` or in `[a_j+2,0]`; no birth at `a_j+1` is
possible. The entire nominal path uses a generator set `J_j` of size at
most `|D_j|/kappa`. These facts hold for the positive threshold used here.
Nested layer bases imply independence at every arrival prefix. Finite rank
operations, fixed tie rules, and countably many rounding levels imply
measurability. The original paper proves these structural facts; this
paper changes the probability and quantitative analysis.

For clarity, the statistics used below are as follows. For valid endpoints
`a_j+2<=b<=0` of the selected parity, set

```math
 \begin{aligned}
 K_{j,b}&=\bigcup_{\ell<j}T_\ell\cap(X_\ell(b)\setminus X_\ell(b-1)),\\
 P_{j,b}&=G_j\cap(X_j(b)\setminus X_j(b-1)),\quad
 O=D\cup C,\quad S_{j,b}=P_{j,b}\setminus O,\\
 z_j&=\sum_b r(S_{j,b}\mid X_j(b-2)\cup K_{j,b}),\\
 \lambda_j&=\sum_b r(T_j\cap S_{j,b}\mid\widehat F(b-2)\cup K_{j,b}).
 \end{aligned}
```

The safe count `sigma_j` counts `d in D_j intersect Y` with such a birth
and `d notin Q_j(F_(j-1)(b-2) union K_(j,b))`. Choose a fixed-order basis
extension `Z_b` of each nominal rank summand; then `sum_b |Z_b|=z_j`.
The residual is

```math
 \mathcal R_j=\bigcup_b\bigl(P_{j,b}\setminus
 \operatorname{cl}(X_j(b-2)\cup K_{j,b}\cup Z_b)\bigr)\subseteq O.
```

For true groups that are unlisted, extend `sigma_i,z_i,lambda_i` by zero.
The original density argument gives `sigma_j<=kappa z_j+|R_j|`. Its
order-uniform lemma says the number of accepted labels of weight at least
that of `G_j` is at least `lambda_j`, for every complete seed and order.
The later-path rank cost is bounded once over the whole timeline by

```math
 c_j=|C_j|+\sum_{\ell>j}(|C_\ell|+|D_\ell|/\kappa).
```

Conditional on `H,D,C`, parity, and test bits outside the focal group,
independent focal thinning gives `E lambda_j >= t(z_j-c_j)`.
These are the source interfaces used in the final accounting, with their
probabilities retained rather than rounded to the source's numerical bounds.

## 2. A quadratic resource for one transaction

Fix an increasing event `A` on finitely many independent bits, and a
predictable query procedure which reads each bit at most once and determines
whether `A` holds. Let `p=Pr(A^c)`. At an intermediate query transcript write
`W` for the remaining coordinates and `I` for its queried positive answers.
Define

```math
 m=\Pr(A^c\mid\text{transcript}),\qquad
 q=\Pr(A^c\text{ with only }W\text{ random and all other bits zero}).
```

The unqueried product law is preserved by predictable queries. Equivalently,
`m` is the failure probability with `I` forced positive, all queried negatives
zero, and `W` random. Increasingness gives `0<=m<=q<=1`. Initially `m=q=p`.

If the next queried coordinate is `e`, the next depleted probability
`q'=f(W\{e})` is determined **before its answer** and satisfies `q'>=q`.
The actual conditional failure probability `m'` is a martingale:
`E[m' | transcript]=m`. For

```math
 \Phi(q,m)=q^2-2qm
```

we therefore have the exact identity

```math
 \mathbb E[\Phi(q',m')\mid\text{transcript}]-\Phi(q,m)
 =(q'-q)(q'+q-2m)\ge0. \tag{Q}
```

At the completed transaction, `m=1_{A^c}`. Failure implies `q=1`, because
`m<=q<=1`. Survival implies `m=0`. Since there are at most the original
number of coordinates to query, sum (Q) over a finite, zero-padded sequence.
The initial potential is `-p^2`; the final expectation is
`E[1_A q^2]-p`. Thus

```math
 \boxed{\mathbb E[\mathbf1_A q^2]\ge p(1-p).} \tag{R}
```

This includes `p=0` and `p=1` without division, logarithms, limiting arguments,
or a positive-hazard assumption. It also applies when no query is needed.
The essential facts are the actual conditional-probability martingale,
the predictability of `q'`, increasingness, and a transcript deciding `A`.

## 3. From one transaction to expected exit hazard

Condition on `H,D` and a listed-group prefix as in the source reverse
computation. Fix a nonloop `d` still alive just before a step. Its fresh
domain is the union of the group restrictions to the current states `S`.
Let `A` be the increasing event that `d` survives the reverse transition
`G_k(c,S)`, and let `p` be its conditional failure probability.

For completeness, the reverse map on a fixed listed-group prefix is
```math
 A_0=F_{\varnothing},\qquad N_j=Q_{j,k}(A_{j-1}),\qquad
 A_j=\operatorname{cl}\bigl(N_j\cup\{e\in G_j\cap S_j:c_e=1\}\bigr),
```
where `F_empty=cl(empty)`, `k<0`, and the output is the vector `(N_j)_j`.
Starting from `X_j(0)=E`, compute `X(k)=G_k(C,X(k+1))` in decreasing time.
For an actual later state, `N_j` is contained in `S_j` for every fresh bit
assignment. Query only `G_j intersect (S_j minus N_j)` after computing `N_j`;
unqueried additions are already spanned. The remaining domain is
`union_j (G_j intersect N_j)`.

The source queries exactly the departing coordinates, in predictable
group batches. These answers determine every output state: omitted bits
lie inside an already spanned flat and cannot change it. In particular,
the completed transcript decides `A`. This verifies the hypotheses of (R),
including failure transcripts, not just positive survival certificates.

Write `S'` for the actual output and `V'` for the remaining coordinates.
For every assignment `c` supported on `V'`, monotonicity gives

```math
 G_{k-1}(c,S')\subseteq G_k(c,S).
```

On the right every just-queried coordinate is zero, which is exactly the
depleted experiment defining `q`. Conditional on the complete post-step
transcript, the bits in `V'` still have their independent product law.
On survival, the next conditional exit probability `r` therefore satisfies
`r>=q`. Both states are frozen for this comparison; earlier states are not
recomputed when the queried bits are reset. No arrival order is conditioned on.

By (R), the next alive **squared** hazard obeys

```math
 \mathbb E[\mathbf1_{\rm survive}r^2]-p^2
 \ge p(1-p)-p^2=p-2p^2. \tag{D}
```

Set the potential to the squared current conditional hazard while alive,
and zero after exit. Every nonloop exits within the source's deterministic
finite reverse horizon. Sum (D), with initial hazard `p_start`, to obtain

```math
 -p_{\rm start}^2\ge
 \sum_i\mathbb E[\mathbf1_{\rm alive}p_i]
 -2\sum_i\mathbb E[\mathbf1_{\rm alive}p_i^2]
 =1-2\mathbb E P,
```

where `P` is the hazard at the actual exit. The first sum is one because
exit is certain; the second is `E P` by conditioning at each possible exit.
Consequently

```math
 \boxed{\mathbb E P\ge(1+p_{\rm start}^2)/2\ge1/2.} \tag{H}
```

This improves the previous `5/16` bound. The source hybrid transition needs
equal guard and test rates, which are still both `t`. Its safety comparison
turns (H) into pre-parity safe mass at least `|D_h intersect Y|/2`, less
the same baseline-birth charge `|D_h|/kappa`. The independent parity halves
both terms. Averaging the density mask, now of rate `rho`, gives

```math
 \mathbb E[\sigma_i\mid H]\ge
 \gamma|Y_i|-\frac{\rho n_i}{2\kappa},\qquad \gamma=\rho/4=7/64. \tag{S}
```

On unlisted groups the extension by zero is valid before averaging over `D`.
No conditioning on listing is introduced.

### A limitation of this abstract exit argument

The `1/2` in (H) is sharp under just these query hypotheses. Take `N`
independent Bernoulli-`t` bits. Each transaction tests the OR of the remaining
bits, querying in fixed order until a positive answer, or until all remaining
bits are negative. On survival, repeat with the remaining suffix. The next
failure probability equals the depleted current probability. Exit is certain
within `N+1` transactions, and every survival has a positive certificate.

Writing `a=1-t`, classify by the last positive bit, including no positives:

```math
 \mathbb E P=a^{2N}+t\sum_{j=0}^{N-1}a^{2j}
 =a^{2N}+\frac{1-a^{2N}}{2-t}.
```

For `t=1/m` and `N=m^2` this tends to `1/2`. Thus a larger universal
constant requires additional structure beyond these abstract hypotheses.
This is **not** a claimed hard matroid instance or an upper bound on the
achievable prophet ratio.

## 4. Couple the two pivot descriptions

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

### 4.1. Joint counting lemma

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

### 4.2. Use the density sample's size

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

## 5. Biased filtering and order-uniform accounting

For a filter mask of rate `h`, the source's elementary filter proof gives

```math
 \mathbb E_H u(Y)=(1-h)W,\qquad
 \mathbb E_H u(U)=\frac{1-h}{h}\mathbb E_H u(\mathrm{greedy}(H))
 \le\frac{1-h}{h}W.
```

To see the identity, condition on the memberships of labels preceding `e`
in rounded priority. Its span test is then fixed. The candidate probability
is `1-h` times that test, whereas greedy selection in `H` has probability
`h` times the same test. Sum weighted contributions. `Y` remains independent
and a subset of `U`. At `h=3/4` the coefficients are `1/4` and `1/3`.

The rank accounting and independent focal test thinning are unchanged.
The density-mask contribution to the later-generator cost becomes
`rho/kappa`, not `1/(4 kappa)`. Put `beta=(B-1)/B` and

```math
 L_0=\bar\epsilon+t\kappa+\frac{t\kappa+\rho}{B-1},\qquad
 s=(1-h)\left(\gamma-\frac{L_0}{h}\right).
```

The source's order-uniform comparison, summed over the large groups, gives

```math
 \mathbb E_R\min_\pi\mathrm{reward}_{\rm main}
 \ge\frac{\beta t s}{\kappa}W-t\gamma m_*.
```

Here `m_*` is the largest rounded nonloop weight. For completeness, the group
estimate is `E lambda_i >= (t/kappa)[gamma |Y_i|-(bar epsilon+t kappa)n_i
-(t kappa+rho)sum_(j>i)n_j]`. The weighted higher-group sum is at most
`u(U)/(B-1)`. Discarding groups with `n_i<kappa` loses comparison mass at
most `kappa m_*/beta`, giving the displayed negative term. These are
deterministic geometric estimates for every `B>1`.

The independent maximum branch has worst-order expectation at least `m_*/4`.
With main probability `p_main=1-t`,

```math
 (1-p_{\rm main})/4=t/4\ge p_{\rm main}t\gamma.
```

Thus mixing cancels the negative term. The minimum over permutations stays
inside the expectation throughout; seed visibility has not been weakened.

## 6. Finer finite phases and the exact coefficient

For any `theta>1`, `B=theta^L`, and positive scalar `x`, write
`k=floor(log_theta x)`. As `J` ranges uniformly over `0,...,L-1`, the rounded
values are `theta^(k-r)`, once each for `r=0,...,L-1`. Since `theta^k>=x/theta`,

```math
 \mathbb E_J u_J(x)\ge
 \frac{1-B^{-1}}{L(\theta-1)}x=\frac{\beta}{5}x.
```

The same lower bound applies to the rounded optimum by applying it to one
fixed true optimal independent set. Zero coordinates are unchanged. This is
the earlier standard finite-offset method with a finer rational mesh, not
a new rounding principle. Every phase is visible to the adversary, and the
fixed-phase guarantee already bounds its worst order.

Combining with the preceding affine guarantee and then using the source's
lossless glued-vector simulation gives

```math
 C=\frac{p_{\rm main}\beta^2 t s}{5\kappa}.
```

Exact integer arithmetic verifies `261^256>140*256^256`, hence `B>140`
and `beta>139/140`. In particular,

```math
s>\frac{\gamma}{4}-\frac13\left(
\bar\epsilon+t\kappa+\frac{t\kappa+\rho}{139}\right)
=\frac{23047361}{3527086080}>0.
```

Substitution gives `C>C_1>(21/20)2^-34`. Relative to the published
`C_0=9652683394380719/637507023635152349901619200`,
`C_1/C_0=4.056975824...>4`. All these scalar inequalities are certified with
exact rational arithmetic.

The simulation reveals and sacrifices the mask fixed by the seed, taking
the glued weight from the sample on that mask and the online value elsewhere.
Conditional on the entire seed this vector has the original product value
law, so it is independent of the seed. Ignored samples, sacrificed values,
and unused random bits can still inform the adversary's chosen permutation;
the pointwise minimum over every permutation covers all of them.

## 7. Resources, checks, and remaining review

Per label, draw two fair bits for `H` (three of four outcomes), four for `D`
(seven of sixteen), fifteen each for `C` and `T` (one of `2^15`), and one for
the maximum mask. Shared bits are eight for the phase, fifteen for the branch,
and one for parity. This is exactly `37n+24`, including unused-branch coins.

All new scalar constants and the 256 phase multipliers are fixed rationals.
The matroid rank/closure tables and enumeration of flats may be exponential
in `n`; they remain charged preprocessing and storage, not free oracles.
The rule uses only finitely many occupied groups and the source's finite
auxiliary timeline. Group exponents and exact observations need not have
bounded precision. For rational inputs the phase and level comparisons can
use exact rational powers; their costs depend on input bit lengths and
exponents. For arbitrary real observations this remains the original exact,
measurable model. No polynomial running-time, uniform precision, or practical
performance claim is made.

[check_joint_residual.py](verification/check_joint_residual.py) compares
45,824 actual residual encodings against both pivot streams and 331,491
affine signs on 170 small matroid/weight instances. It exercises early births,
both parities, shifted generators, and an explicit missing-shift negative
control; it also checks 48 binomial tails, 120 floor bounds, and 24 current
phase boundaries. [The scalar certificate](verification/certify_joint_residual.py)
certifies the displayed coefficient and its analytic log bounds.

[check_quadratic_hazard.py](verification/check_quadratic_hazard.py) tests
the actual reverse process on the same 170 small matroid/weight instances
as the earlier checker, with nontrivial stress parameters. It checks failure
depletion, squared resource and drift, and the stronger global inequality
including `p_start^2`, using exact fractions.
[check_quadratic_ingredients.py](verification/check_quadratic_ingredients.py)
checks the query identity over all increasing Boolean events on up to four
bits, including adaptive query orders, empty/constant events, and both a
stress rate and the actual guard rate. It also checks biased filtering,
selected residual expectations, rational rounding boundaries, and the
abstract sharpness family. These are finite evidence; the universal proof
is the mathematical argument above.

The new [same-agent audit](proofs/joint_residual_audit.md) checks the shared
variable representation, the early/parity cases, and the cutoff without
conditioning the product law on sample size. The retained audit rechecked (Q)'s predictable denominator and conditional
martingale, both terminal outcomes, the frozen-state containment, the sign
of the telescope, the integral at `n=kappa`, all changed mask factors,
rational-phase boundaries, and full-seed simulation. Independent review
and formalization remain outstanding. This repository contains the manuscript
with reproducible evidence; it does not claim independent validation,
established priority, or a confirmed best-known bound.

## 8. Related work and development history

OpenAI's manuscript derives a `2^-293` coefficient in this model, stronger
than its `2^-310` headline; that derived coefficient is our documented
baseline. Structural dependencies and source revisions are recorded in
[BASELINE.md](BASELINE.md).

[Daniel (@firsttimelifer)](https://x.com/firsttimelifer/status/2108282829809541468)
publicly announced a `2^-47` guarantee on October 8, 2026. A supporting
write-up was unavailable for comparison at the October 10 audit; we have
not verified its assumptions or proof. We acknowledge it as an unverified
announcement and do not use it as an established baseline.

This research effort progressed through `2^-63`, `2^-43`, `2^-36`, and
`2^-34` on October 10, 2026. The first checkpoint refined source parameters,
affine branch mixing, and finite rounding offsets. The second introduced a
logarithmic hazard potential and tighter residual accounting. The published
`2^-36` version introduced the quadratic potential and integrated tail; it is
preserved at [commit 669e97c](https://github.com/shea256/matroid-prophet-inequality/tree/669e97c863aa7863c93258a5a1e2c6d9165b2d2b).
The current refinement adds shared-variable residual counting and the density
cutoff. The [dated archive](archive/README.md) preserves the first two stages.
These are stages of one research effort, not separate discoveries of the
original constant-guarantee theorem.
