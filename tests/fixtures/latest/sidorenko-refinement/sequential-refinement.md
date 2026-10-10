# A sequential basis count gives residual constant 189

October 10, 2026. This additional research draft replaces the counting
step behind the residual constants 1641, 1032 and 978 in `proof.tex`,
retaining its upstream dependencies.

Those bounds count the m active pair spaces as free two-dimensional
subspaces of the global span, costing q^(2(k-2)) each, and then multiply
by the containment probabilities q^(-D k_i + binomial(k_i,2)). The source's
own direct-case argument is sharper: it places one basis vector at a time,
and every new vector must be symplectically orthogonal to everything already
placed at either endpoint, because both lie in the same Lagrangian. The new
section runs that argument for nondirect families as well.

Each basis vector x of a pair space on {i,j} gets a type (g, l_i, l_j):
g=1 if x leaves the span W' of all earlier vectors, l_i=1 if x leaves the
span V'_i of the earlier vectors at pairs containing i. Then l_i, l_j >= g,
the global span dimension k counts the vectors with g=1, the local
dimension k_i counts the vectors at i with l_i=1, and the defect
d = sum k_i - 2k counts the vectors that raise a local span without raising
the global one. Writing v'_i for dim V'_i at the moment x is placed,

    sum_i binomial(k_i,2) = sum over x and endpoints with l=1 of v'_i.

The counts per type are q^(2D - v'_i - v'_j + pi) for (1,1,1), where
pi = dim(V'_i cap V'_j); q^pi for (0,0,0); q^(v'_i) for (0,0,1); and q^k
for (0,1,1). After dividing by ordered bases, multiplying by containments
and the gain 2m, and using the identity, the exponent is -Dd + R with

    R = -2m + sum_{(1,1,1),(0,0,0)} pi
            + sum_{(0,0,1)} (v'_i + v'_j) + sum_{(0,1,1)} (k + v'_i + v'_j).

For d=1 all but one vector has type (1,1,1) or (0,0,0). Bounding
pi <= (v'_i + v'_j)/2 and summing per vertex,

    sum_x (v'_i + v'_j) <= sum_i phi_i(k_i),
    phi_i(x) = binomial(x,2) + (2 deg_i - x) x <= deg_i (2 deg_i - 1),

so R <= sum_i deg_i^2 - 3m + (k_i + k_j - 1)/2 over the allowed pair
graph. Adding a pair changes sum deg^2 - 3m by 2a+2b-1 for current
endpoint degrees a, b, so the full connected 28-pair graph is the maximum:
262 - 84 = 178. The defect pair joins points of degree at most six, giving
11 more. Hence **R <= 189**, and for d >= 2 the same averaging gives
R/d <= 122.

`audit_sequential.py` reconstructs the allowed graph from the saved original
faces and cut bits, checks connectivity and the concavity bound at every
integer, exhausts all 8192 supports and 55,173 relaxed defect-one cases with
an integer convolution confirmed by an independent marginal-gain allocation,
and finds the maximum 189 only on the full support with every local
dimension at or one below full rank (spans 49 through 55). It also checks
the higher-defect ratio 122. Thus this one residual contribution is
O_D(q^(-D+189)), and it vanishes for even D >= 190. The earlier residue and
transverse thresholds of the full construction remain required.

Reproduce with standard-library Python:

```sh
python3 -B audit_sequential.py --output build/sequential-audit.json
```

Create `build/` first if it does not exist. Saved expected results are in
`experiments/sequential-expected.json`. This finite arithmetic check
supplements the proof and does not independently establish the upstream
analytic theorem.
