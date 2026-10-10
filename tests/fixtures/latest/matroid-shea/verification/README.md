# Verification scope

Run `python3 -B scripts/run_checks.py` from the repository root. All Python
checks use the standard library. The default run compares fresh JSON output
with the checked-in references and validates the paper's source/PDF receipt
and local documentation links.

The [current run receipt](current_run_receipt.json) records the current checks
for this joint-encoding refinement. The earlier [full-suite receipt](run_receipt.json)
is retained as a historical execution record; its script hashes identify
the version tested at that time.

| Script | What it checks | What it does not establish |
|---|---|---|
| `certify_joint_residual.py` | Exact coefficient, log enclosures, density exception, and all new parameters | Universal proof correctness |
| `check_joint_residual.py` | Shared affine encoding on actual small paths, early/parity boundaries, negative control, binomial tails/floors, current phases | All matroids or independent review |
| `certify_quadratic_constants.py` | Exact rational inequalities, logarithm bounds, branch mixture, phase/base inequality, coefficient and seed count | Universal correctness of the proof interfaces |
| `check_quadratic_hazard.py` | Actual reverse-map resource, depletion, drift and global hazard inequalities on declared small matroids | All finite matroids or large-instance performance |
| `check_quadratic_ingredients.py` | Every increasing Boolean event on at most four bits at two rates, biased filters, selected residual expectations, rational rounding boundaries, abstract sharpness examples | Universal inference from finite enumeration |

The reverse-map check fixes `H` empty and uses guard rate `1/4` and threshold
2 to exercise nontrivial paths. The separate Boolean-event test also uses
the published guard rate `2^-16`. The biased-filter test uses rate `3/4`.
Residual tests include adaptively selected family members at the published
density rate; their logarithms have outward rational bounds. The new joint checker covers the current phase mesh and density exception.
Every theorem
parameter need not produce nontrivial behavior on tiny ground sets, so these
stress cases are explicitly distinguished from the final algorithm's parameters.

The default suite includes 4,916 local quadratic checks, 3,153 global hazard
checks, 398 adaptive-event transactions, 5,992 biased-filter vectors, 560
residual expectations, and 40 rounding boundary cases. Reference outputs
are under [reference/](reference/). The new checker adds 45,824 residual encodings, 331,491 affine signs, 48
binomial tails, 120 floor bounds, and 24 current phase boundaries.
[Current scalar output](reference/joint_residual_constants_output.json);
[joint output](reference/joint_residual_checks_output.json).

## Retained exhaustive checks

`--full` also runs `finite_checks.py` and `check_online_rule.py`. These retain
earlier structural checks over all 92 labeled matroids of size at most four,
and the declared online-rule cases with more than five million complete
arrival-order runs. They use the older scripts' documented stress probabilities
and rounding configurations; the current analytic probability bounds and rational
phase mesh are checked by the new scalar and joint suites. These are structural
regressions, not an empirical demonstration of the final competitive ratio.

`reverse_support.py`, `finite_checks.py`, and `check_online_rule.py` provide
shared finite models and exact helpers. Reusing them is not independent review.
`source_manifest.json` records upstream source hashes, not a Lean build receipt.
`paper_build.json` records the PDF build, not a proof-checker result.

No new theorem has been formalized in Lean, and no independent mathematical
review is recorded. The universal claim rests on [the written proof](../manuscript.md)
and its cited structural lemmas. See [review questions](../HANDOFF.md).

## Archived checkpoints

The [dated archive](../archive/README.md) preserves the original `2^-63` and
`2^-43` proofs, scalar certificates, and finite checks. Run
`python3 -B scripts/check_archive.py --full` to verify the preserved hashes
and reproduce all five archived programs. The
[archive receipt](archive_run_receipt.json) records the actual run; archived
comparisons and labels are historical, not the current result record.
