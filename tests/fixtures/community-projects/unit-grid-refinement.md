# Unit distances: reducing the final generic grid

An independent, AI-generated research draft prepared with Codex. We give a conditional reduction of the final algebraic grid in OpenAI's unit-distance argument from **20×5 to 9×4**, or 100 selected edges to 36.

**This does not improve the headline unit-distance exponent or provide an explicit power saving.** The original generic-grid extraction, negligible-height passage, and private-valuation arguments remain dependencies. Independent mathematical review, formal verification, and literature priority are not claimed.

## Argument

The source obtains equations

$$2(p_i-r_\ell)\cdot(H_i-U_\ell)=R_{i\ell}(A_i-A'_\ell),\qquad A_i-A'_\ell\ne0.$$

Let $J(x,y)=(-y,x)$, $v=r_2-r_1$, and

$$\omega=\frac{(U_2-U_1)\cdot Jv}{v\cdot v}.$$

The denominator is nonzero because the anchors are distinct real points at the finite indices. Subtract a common translation and infinitesimal rotation from all velocities, and subtract $A'_1$ from all logarithmic velocities:

$$\widetilde H_i=H_i-U_1-\omega J(p_i-r_1),\qquad \widetilde U_\ell=U_\ell-U_1-\omega J(r_\ell-r_1).$$

The equations are preserved since $x\cdot Jx=0$. The first right velocity and first logarithmic velocity become zero, while the second right velocity is parallel to $v$. With four anchors, the remaining right-hand data require only **eight field generators**: five velocity coordinates and three logarithmic scalars.

Nine generic left points therefore guarantee a point surviving as generic after those generators are adjoined. The source's private valuations make the radical square classes independent. Three equations determine the rank-two solution; changing the fourth radical's sign gives the contradiction. In the common-line case, two equations and a third sign change suffice.

The full conditional proof, including the coefficient-field argument, is in [proof.tex](proof.tex). The normalized data need not themselves arise from a new derivation; the later argument uses the preserved equations. No quantitative replacement for the earlier asymptotic extraction is supplied.

## Common-line branch: 18 edges

If both loci are known to be the same line, three right anchors suffice for the final two-unknown Cramer system and the third radical sign change. Their normalized data cost is five generators, so six left points guarantee a surviving generic point. This branch therefore needs a **6×3 grid, or 18 selected edges**, conditional on the same generic-grid and private-valuation lemmas.

The full rank-two case continues to use 9×4. The new proof section and tests explicitly retain radical independence: a dependent-radical control makes the Cramer determinant vanish. This is a smaller witness for one branch, with no new headline exponent.

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

## What the tests establish

The seven tests check symbolic invariance under the normalization, the second velocity's parallelism, 1,000 seeded exact-rational proposals, the eight-generator accounting, and rejection of the wrong rotation sign. The new checks also verify the common-line Cramer solution, third-radical sign subtraction, and six-point survival budget. The boundary check shows why eight left points do not suffice for this particular dimension-counting argument.

These are algebraic checks of the displayed reduction. They do not construct the generic grid, verify the source's ultraproduct lemmas, or prove a new incidence bound.

## Original source

OpenAI, [*A power saving for planar unit distances*](https://github.com/openai/math/tree/fd4aeeb2ee4fc729c18d98444fed42fd0529eeeb/preprints/A-power-saving-for-planar-unit-distances-September-23-2026), September 23, 2026, at commit [`fd4aeeb2ee4fc729c18d98444fed42fd0529eeeb`](https://github.com/openai/math/tree/fd4aeeb2ee4fc729c18d98444fed42fd0529eeeb). The relevant arguments are in the original algebra section: the generic grid, surviving point, private valuations, and final sign change.

[source-manifest.json](source-manifest.json) records the inspected source hash. Optionally retrieve it with `python -B fetch_sources.py --output upstream`; the tests themselves do not need a network connection once dependencies are installed. Credit for the original construction and imported lemmas belongs to OpenAI. This is not an official OpenAI publication.
