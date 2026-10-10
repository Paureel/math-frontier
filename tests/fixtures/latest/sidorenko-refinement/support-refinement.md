# Active supports give residual constant 978

October 9, 2026. This additional research draft refines
the residual calculation in `proof.tex`, retaining its upstream dependencies.

In that calculation let S be the vertices supporting at least one active
pair space. Every active pair space has dimension two, so a local span at
a vertex is either zero, outside S, or at least two, inside S. Write m_S
for the number of allowed graph edges induced by S, using the same 28-edge
graph already certified from the source's cuts. Then

    m ≤ m_S,    2 ≤ k_i ≤ min{k, 2 deg_S(i)} for i in S.

The caps follow because local spans are contained in the global k-dimensional
span and are sums of at most deg_S(i) two-dimensional spaces. Supports with
an isolated vertex are impossible. For defect one, sum k_i=2k+1. Since
the coefficient of m in the remainder is 2k−2>0, the previous expression is
bounded above by

    −k² + 2m_S k − 2m_S + max sum_i binomial(k_i,2),

where the maximum uses the displayed caps, lower bounds two, and fixed total.
Sort the caps decreasingly. Start every coordinate at two and allocate the
remaining total to the largest caps in order. This vector majorizes every
feasible vector: after sorting, the sum of any first j coordinates is at
most both the first-j cap sum and the full total minus the obligatory two
for every remaining coordinate. The greedy vector achieves these bounds.
Convexity of x(x−1)/2 therefore gives the maximum. An independent convolution
dynamic program computes the same maximum without using this greedy lemma.

`audit_support.py` reconstructs the allowed graph from the saved original
faces and cut bits, enumerates all 8192 vertex masks, and checks all 55,173
feasible relaxed defect-one cases. Their maximum is **978**, attained in
the relaxation with all 13 vertices, m_S=28, k=33, and local dimensions
(12,12,12,12,3,2,2,2,2,2,2,2,2). No claim is made that these relaxed dimensions
are realizable by a subspace arrangement; realizability is unnecessary for
an upper bound. In this case the binomial sum is 275, giving
−33²+56·33−56+275=978.

For defect at least two the previous coarse remainder bound 1196 still
applies. At D≥978, −2D+1196≤−D+978. Thus this one residual contribution
is O_D(q^(−D+978)), and it vanishes for even D≥980. The earlier residue
and transverse thresholds of the full construction remain required.

Reproduce with standard-library Python:

```sh
python3 -B audit_support.py --output build/support-audit.json
```

Create `build/` first if it does not exist. Saved expected results are in
`experiments/support-expected.json`. This finite arithmetic check supplements
the proof and does not independently establish the upstream analytic theorem.
