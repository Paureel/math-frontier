# Same-agent second-pass audit of the joint residual refinement

October 10, 2026. This is not independent review or formalization.

The [written proof](joint_residual.md) was checked again against the pinned
source's entire marked-pivot and residual-encoding arguments. No remaining
gap was identified in this pass. The following are mathematical obligations,
not conclusions inferred from passing finite tests.

| Obligation | Second-pass assessment |
|---|---|
| Old sequences fixed before the focal masks | The incoming path, competing test sets, parity, group index, and activation are fixed under the source conditioning. Neither listing nor the density cutoff is conditioned on. |
| Shared variables actually represent both sequences | A generator has first score `eta*x` and second score `d*x`. Moving an opposite-parity insertion to its endpoint multiplies its absolute score by the single fixed factor `2^T`. No individual insertion time enters an affine coefficient after its type is fixed. |
| Early invalid births | A generator of the selected parity can still be too early. Its type is `(-1,1)`, distinct from the opposite-parity `(-1,2^T)` type. Both are charged in `3^j`. |
| Reordering generator blocks | All generators in a second-sequence endpoint block have mark one. Reordering them preserves the span at each block boundary and all pivot marks, although retained bases may change; the separate `4^(j+z)` basis bound covers them. |
| Simultaneous dominance | Scores are distinct powers of two in occurrence order separately in each sequence. The same variable may have a different coefficient in the second sequence; simultaneous magnitude ordering across the two sequences is not assumed. |
| Supports and basis count | Both old streams span the full matroid. The source rank-drop argument gives at most `4^j` and `4^(j+z)` retained bases. A basis's unique support for each nonloop gives the affine form. Repeated labels are treated as occurrences and cannot both be retained in a basis. |
| Ambient ground-set size | The embedding's spacing uses the whole ground-set size. That changes coefficient magnitudes, not the arrangement dimension or the number of tested functions. The final bound depends on `2n` tested labels and `j+z` variables, with no hidden timeline or ambient-size factor. |
| Large nominal rank | On `|D|<=rn`, if `z>floor(rn/kappa)`, then `kappa*z>rn>=sigma`. Thus the smaller witness cutoff does not discard an uncharged branch. |
| Bad density outcomes | Charge `n` to the error on the whole bad event. The binomial Chernoff bound is taken under the original product distribution; it is not used after conditioning on good outcomes. |
| Residual union bound | On good small-rank outcomes, the residual lies in the fixed joint family and in `D union C`. Dropping the good-event intersection permits the ordinary product probability for each fixed family member. |
| Floors and smallest groups | `q=0` is allowed. The binomial-sum bounds use `alpha=r/kappa`, and the integrated tail's additive one is absorbed using `n>=kappa`. |
| Final theorem implication | The changed rank error feeds the same affine main-branch bound, maximum-branch cancellation, finite-phase rounding, and lossless one-sample simulation. The minimum over orders stays inside expectation. |
| Resources | The density cutoff and signed scores are analysis devices. The implementation needs the changed masks/phases and `37n+24` fair bits; prior potentially exponential preprocessing/storage and exact-value precision remain charged. |

The exact certificate uses conservative rational bounds, separately proving
the logarithmic inequalities and the final coefficient. The finite checker
compares actual path residuals, streamed pivot marks, and support-affine signs;
it also checks floors, binomial tails, and rounding boundaries. Its initial
version failed a required coverage assertion. The finalized checker adds an
explicit triangle negative control for omitting the score shift, avoids
redundant focal-test enumeration, and passes all stated coverage assertions.
The negative control is an abstract support example, not a claimed lower-bound
instance for the matroid algorithm.

Independent review should focus first on the shared-variable lemma, then the
cutoff's conditioning and complete error charge. The retained quadratic
hazard proof also remains a dependency requiring independent review.
