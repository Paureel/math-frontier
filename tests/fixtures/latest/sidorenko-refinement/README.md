# Sidorenko: finite-template minimum and a smaller residual bound

An independent, AI-generated research draft prepared with Codex, following OpenAI's *A counterexample to Sidorenko's conjecture*. This repository contains three refinements of its method, proofs, exact certificates, and a reproducible enumeration.

**Scope:** a computer-assisted minimum within a specified finite construction template, and a smaller constant in one counting step. This is **not** a minimum for all Sidorenko counterexamples, a smaller general counterexample, or a verified bound on the full construction's dimension. The results depend on the stated source arguments and, for enumeration completeness, plantri. Mathematical priority and formal verification are not claimed.

## Results and proof ideas

### A 35-vertex minimum within the finite template

The template has distinct triangular faces; every point pair occurs in exactly two faces; each admissible cut partitions the faces into two spanning exposure orders; a probability distribution over cuts crosses every pair with probability at least $1/3$; and incidence color refinement, starting from the two part colors, is discrete.

Each exposure order builds a triangulated polygon containing every point on its boundary. Gluing the two polygons gives a sphere triangulation. Admissible cuts correspond to Hamiltonian cycles in its point graph. Consequently, if $a_e$ is the crossing probability,

$$\sum_{e\ni v}a_e=2.$$

Thus $a_e\ge1/3$ forces every point degree to be at most six. We enumerate all simple sphere triangulations on 4 through 12 points and filter by that condition and discrete incidence refinement:

| Points | All triangulations | Degree at most six | Discrete refinement | Exact obstructions |
|---|---:|---:|---:|---:|
| 4 | 1 | 1 | 0 | 0 |
| 5 | 1 | 1 | 0 | 0 |
| 6 | 2 | 2 | 0 | 0 |
| 7 | 5 | 5 | 0 | 0 |
| 8 | 14 | 10 | 0 | 0 |
| 9 | 50 | 15 | 1 | 1 |
| 10 | 233 | 30 | 4 | 4 |
| 11 | 1249 | 44 | 12 | 12 |
| 12 | 7595 | 77 | 23 | 23 |

For each surviving graph, the saved nonnegative rational edge weights sum to one and give **every Hamiltonian cycle weight strictly below $1/3$**. Any admissible cut mixture would instead have expected weight at least $1/3$, a contradiction. This excludes arbitrary weighted mixtures, not just three equally weighted cuts.

An independent exact verifier uses Held–Karp dynamic programming, checks 16,941 cycles in aggregate, and obtains a minimum separating margin of $1/75$. The original 13-point, 22-face certificate gives the matching 35-vertex incidence graph. Completeness remains dependent on plantri's enumeration algorithm; the certificates are not Lean proofs.

At 13 points, a further enumeration leaves exactly two feasible isomorphism classes within the finite template. One is the original; the other is a different 35-vertex finite certificate. Both pass the combinatorial and support checks. **The alternative is not claimed as a newly proved counterexample:** its full analytic transfer has not been independently verified.

### Residual constant: 1641 to 189

The latest refinement redoes the nondirect residual count one basis vector at a time, as the original paper already does in its direct case. Every new vector is symplectically orthogonal to everything already placed at either endpoint, which cancels the containment cross terms, and the defect $d=\sum_i k_i-2k$ counts exactly the vectors that raise a local span without raising the global one. Averaging the remaining intersection terms over the 28-pair allowed graph gives

$$R\le\sum_i\deg(i)^2-3m+\left\lfloor\tfrac{k_i+k_j-1}{2}\right\rfloor=262-84+11=189,$$

and defects at least two give ratio at most $122$. An exhaustive audit over all $8{,}192$ supports and $55{,}173$ relaxed defect-one strata attains exactly $189$, only on the full support with every local dimension at or one below full rank. See [sequential-refinement.md](sequential-refinement.md). Thus this nondirect residual contribution is

$$O_D(q^{-D+189})\qquad(D\ge189),$$

and **even dimension 190** suffices for this one step, instead of the earlier 980, 1034, or source 1642. Earlier residue and transverse thresholds remain required and may dominate. The graph, cuts, and activation laws are unchanged. The two earlier refinements below are retained as the history of the bound.

### Earlier refinements: 1641 to 1032 to 978

The original proof's equality stratum forces zero pair dimension wherever cut coverage exceeds $1/3$. Its published cuts exclude five pairs, leaving only 28 potentially active pairs. This tightens the local dimension caps.

Writing $d=\sum_i k_i-2k\ge1$, the original counting exponent, including the gain, is bounded by

$$-Dd-k^2+2mk-2m+\sum_i\binom{k_i}{2}.$$

The new caps first bound the remainder by 1196. The earlier relaxation gave 1032. Tracking the active vertex support further requires every supported local dimension to be at least two and uses the degrees of its induced allowed graph. A convexity argument and independent integer dynamic program check all 55,173 feasible defect-one cases over all 8,192 vertex subsets, obtaining **978**. Defects at least two remain covered by the coarser bound. See [support-refinement.md](support-refinement.md) for the full new argument. Thus this nondirect residual contribution is

$$O_D(q^{-D+978})\qquad(D\ge978).$$

Even dimension **980** sufficed for this one step at that stage; the sequential count above now lowers it to 190.

## Reproduce

Use Python 3.11 or 3.12:

```sh
python3 -m venv .venv
. .venv/bin/activate
python -m pip install -r requirements.txt
python -B run_checks.py
```

GitHub Actions runs the same command on pushes and pull requests. Do not enable Python optimization (`-O` or `PYTHONOPTIMIZE`); certificate assertions must remain active. The runner rejects optimized execution.

The full argument is in [proof.tex](proof.tex), which has been compiled successfully with the Codex document editor. No compiled PDF is bundled. The tests supplement the mathematical argument; they are not a formal proof of the original papers or an independent review.

The Sidorenko runner also requires a C compiler (`cc`, or set `CC`) and network access to retrieve one hash-verified original source file. It builds the included unmodified plantri source into ignored `build/`, reruns the enumeration through 13 points, checks the saved certificates independently, verifies the original finite certificate, and recomputes the residual bounds from the original published table. Outputs go to `build/`; the saved evidence is preserved.

## Evidence and tests

- [Exact obstruction witnesses](experiments/cut-obstructions/summary.json), [independent minimum check](experiments/minimality-independent.json).
- [Order-13 classification](experiments/order-13-classification-independent.json) and [two feasible certificates](experiments/order-13-cuts/).
- [Residual arithmetic expectations](experiments/residual-expected.json), including every span case.
- [Active-support expectations](experiments/support-expected.json) and [independent support audit](audit_support.py), included in the standard runner.
- [Sequential-count expectations](experiments/sequential-expected.json) and [independent sequential audit](audit_sequential.py), included in the standard runner; see [progress.md](progress.md) for the bound over time.
- [verify_minimality.py](verify_minimality.py) reconstructs faces and refinement separately from the proposal code and optimizes Hamiltonian-cycle weights exactly, without SciPy.
- [check_complex.py](check_complex.py) checks pair multiplicity, connectedness, exposure orders, coverage, refinement, and support intersections. Duplicate-face and incomplete-exposure mutations are rejected.
- A corrupted edge-weight certificate is rejected. Floating-point LP success or failure is never used as the final infeasibility certificate.

To regenerate proposed witnesses, install `requirements-search.txt` and use `certify_cut_obstructions.py --help`. The included optimizer uses SciPy only to suggest rational witnesses; the independent verifier certifies them. `enumerate_triangulations.py` and `search_complex.py` retain the proposal methods for inspection.

## Original sources and third-party code

- OpenAI, [*A counterexample to Sidorenko's conjecture*](https://github.com/openai/math/tree/fd4aeeb2ee4fc729c18d98444fed42fd0529eeeb/preprints/A-counterexample-to-Sidorenkos-conjecture-September-23-2026), September 23, 2026, pinned at [`fd4aeeb2ee4fc729c18d98444fed42fd0529eeeb`](https://github.com/openai/math/tree/fd4aeeb2ee4fc729c18d98444fed42fd0529eeeb). The original authors retain credit for the construction, analytic lemmas, and baseline certificate.
- [source-manifest.json](source-manifest.json) pins and hashes the original finite-complex table used in the residual audit; `fetch_sources.py` retrieves it from the original repository.
- [plantri 5.8](https://users.cecs.anu.edu.au/~bdm/plantri/), by Gunnar Brinkmann, Heidi Van den Camp, and Brendan McKay, supplies the enumeration. Its unmodified C source, manual, [Apache 2.0 license](vendor/plantri/LICENSE-2.0.txt), and [download provenance](vendor/plantri/provenance.json) are included. The saved verification receipt pins the C-source hash.

This repository is an independent follow-up, not an official OpenAI publication.
