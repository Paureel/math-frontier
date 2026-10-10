# The Quasi-Riemann Hypothesis: A Zero-Free Half-Plane $\Re(s)>0.8749570698$

[paper.pdf](paper.pdf) states and proves nonvanishing for
`Re(s) > 4374785349/5000000000 = 0.8749570698`
for finite-order Hecke L-functions over `Q(sqrt(-3))` and Dirichlet
L-functions, including the Riemann zeta function, with the principal pole
allowed. It extends the analytic estimates in OpenAI's
[seven-eighths manuscript](https://github.com/openai/math/blob/adc7f1241b42e322a6451854ab7e4b4c146bf78a/preprints/The-Quasi-Riemann-Hypothesis-September-30-2026/build/paper.tex).

This is a small numerical extension of that result. It uses the 7/8 proof
throughout and is only as sound as that proof. The paper, the Lean proofs,
and the scripts were entirely AI generated.

The geometry uses slot-length increase `t = 42930200831/250000000000000`
and asymmetry `k = 12457523527/15625000000000`. The physical lengths are
`17/48+k-t/2` and `23/48-k-t/2`. An exact polynomial certificate gives
high-endpoint margin `1/1250000000000`. The low estimate has margin
`831/1000000000000000`. Both margins are strictly positive rational numbers.

[OAIHighUnconditional.lean](lean/OAIHighUnconditional.lean) proves the final
statements without an assumed moment estimate or prior zero-free bound.
It obtains the prior `beta ≤ 7/8`
theorem from upstream and proves the perturbed source moments through
[OAIHighMomentTransport.lean](lean/OAIHighMomentTransport.lean).
The theorem names are
`OAI.SevenEighths.PerturbedZeroFree.bound_zero_supremum`,
`prove_hecke_nonvanishing`, `prove_dirichlet_nonvanishing`, and
`prove_zeta_nonvanishing` in that namespace.

The repository is organized as follows:

```text
paper.pdf                 Compiled paper
tex/paper.tex             Manuscript source
lean/                     Lean sources, toolchain, and Lake configuration
scripts/                  Verification and PDF build scripts
docs/FORMALIZATION.md     Proof dependencies and scope
tests/                    Verification regression tests
```

Run `uv run scripts/verify_bounds.py` from the repository root to check the
rational margins. The Mathlib files in `lean/`,
`BoundsReal.lean`, `EndpointCertificate.lean`, `ReflectedExponent.lean`, and
`LowGramScale.lean` prove the geometry, endpoint, reflected-exponent, and
perturbed Gram-scale inequalities for real
parameters. The project pins Lean 4.34.1 and the Mathlib revision used by the
upstream seven-eighths formalization. Run `lake exe cache get` and `lake build`
from `lean/` to check these four arithmetic modules and the axiom checker.
The following Docker command runs from the repository root:

```sh
docker run --rm --cpuset-cpus 0-3 --cpus 4 --memory 8g \
  --entrypoint /bin/bash \
  --mount "type=bind,src=$PWD/lean,dst=/home/lean/project" \
  --mount type=volume,src=rh-lean-toolchains,dst=/home/lean/.elan/toolchains \
  --workdir /home/lean/project \
  ghcr.io/leanprover-community/mathlib4/lean:latest \
  -lc 'lake exe cache get && lake build'
```

For the full proof, use an adjacent `rh-upstream` checkout of
`https://github.com/openai/math` at revision
`adc7f1241b42e322a6451854ab7e4b4c146bf78a`, with its Lean dependencies
installed. The verifier requires this exact commit and a clean upstream
working tree, including no untracked source files. It checks these conditions
before building or reusing proof objects. The verification script requires
Docker and uses the toolchain volume shown above.

```sh
uv run scripts/verify_oai.py OAIHighAudit
```

This builds the required upstream imports, recompiles every local dependency
in import order, and checks the listed theorems' transitive axiom dependencies
inside Lean. Both audit modules reject every axiom except `propext`,
`Classical.choice`, and `Quot.sound`, including `sorryAx`. They also print
the axiom reports, and the high audit prints the final theorem types.
To resume an interrupted build, add `--resume`. Successfully compiled modules
are retained in `lean/.lake/build/lib/lean/` and reused when newer than their
sources and direct imports. Audit modules always run again. `--only` checks
one module using existing local proof objects. A separate low estimate audit
is available through `uv run scripts/verify_oai.py OAILowAudit`.

The final statements can also be checked with
[Comparator](https://github.com/leanprover/comparator), the judge used for
the upstream challenges:

```sh
uv run scripts/run_comparator.py
```

The challenge
[`lean/comparator/PerturbedQuasiRiemann.lean`](lean/comparator/PerturbedQuasiRiemann.lean)
is upstream's `ComparatorChallenges/HeckeSevenEighths.lean` with the bound
changed to `4374785349/5000000000`. It adds the Mathlib statements for
`riemannZeta` and `DirichletCharacter.LFunction`. The script exports
upstream `lean/` at the pinned commit into `build/comparator/lean`, adds the
local modules, the challenge, and
[the solution](lean/comparator/PerturbedQuasiRiemannSolution.lean), and
builds pinned `comparator`, `lean4export`, and `landrun` with Lean 4.34.1.
Comparator then builds both modules in a Landlock sandbox, checks that the
solution proves the challenge statements with only the three standard
axioms, and replays the solution through the Lean kernel. The first run
copies about 18 GB of upstream Lake directories, then reuses them.

Run `uv run scripts/build_paper.py` from the root to compile the manuscript
twice and update `paper.pdf`. TeX auxiliary files stay in the ignored
`build/tex/` directory. This requires `pdflatex`.

Run the Python regression tests from the root:

```sh
uv run --python 3.12 -m unittest discover -s tests -v
```

After `lake build`, run `lake env lean ../tests/lean/AxiomAuditTests.lean`
from `lean/` to check acceptance of permitted axioms and rejection of an
incomplete proof and a theorem that depends on an added axiom.

See [FORMALIZATION.md](docs/FORMALIZATION.md) for the proof dependencies and the
transport from the certified energy bounds to the perturbed moments.
