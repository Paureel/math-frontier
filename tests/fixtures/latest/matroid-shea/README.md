# One-sample matroid prophet inequalities: a sharper guarantee

By **Ryan Shea**.

A research project on **[OpenAI Math Problem #111](https://github.com/openai/math/blob/main/lean/docs/111.md)**, improving the quantitative
guarantee for one-sample selection on arbitrary finite matroids against an
adversary that sees every sample, value, and random seed bit.

The original construction is in
[OpenAI's accompanying paper](https://github.com/openai/math/blob/fd4aeeb2ee4fc729c18d98444fed42fd0529eeeb/preprints/One-Sample-Suffices-for-Matroid-Prophet-Inequalities-against-an-Almighty-Adversary-September-23-2026/final.pdf).

**[Read the paper (PDF)](manuscript.pdf)** · [Read online](manuscript.md) · [LaTeX source](tex/manuscript.tex)

The current written proof gives

```math
\mathbb E[\mathrm{reward}]\ge 2^{-34}\,\mathbb E[\mathrm{OPT}].
```

It uses one independent sample per label and **`37n+24` initial fair bits**.
The rule needs no description of the value distributions, maintains matroid
independence at every arrival prefix, and retains the full-seed almighty
adversary. Only the offline optimum must be integrable. Computation and
storage may be exponential, and observations are exact; no polynomial-time
or practical-performance claim is made.

**Status: written proof with same-agent
verification. Independent mathematical review and formalization are pending.**
Exact arithmetic and finite tests accompany the proof; they do not prove
its universal assertions. No best-known-bound or priority claim is made.

The repository is public. The author announced the earlier `2^-36` result on
October 10, 2026; this branch proposes the subsequent `2^-34` refinement.

## Contribution

The new step counts two residual pivot tests jointly, sharing each density
generator's variable between them. A cutoff on density-sample size further
reduces the count, with the exceptional event explicitly charged. This
builds on the published **quadratic query potential**, which gives a sharp
`1/2` auxiliary exit-hazard bound. That lemma's constant is not the final
prophet guarantee. The current rule uses 256 rational rounding phases.

The source's density paths, hybrid safety comparison, marked-pivot machinery,
rank accounting, and sample/value simulation remain fundamental dependencies.
OpenAI already established the qualitative constant guarantee. This project
supplies a sharper quantitative analysis of that construction, with the
new argument and its limitations made explicit. See [attribution](ATTRIBUTION.md)
and [the improvement record](IMPROVEMENTS.md).

| Comparison | Guarantee | Evidence available here |
|---|---:|---|
| OpenAI manuscript's derived constant | `2^-293` | Accessible pinned primary manuscript; headline is `2^-310` |
| Published version, commit `669e97c` | `> 2^-36` | Written proof and same-agent verification |
| This proposed refinement | `> 2^-34` | Written proof, exact certificates, finite checks; independent review pending |

The comparison uses the source's stronger derived bound. These are guarantee
coefficients, not measured speedups or observed performance. Unverified
announcements are discussed separately in [related work](BASELINE.md#related-work-and-comparison-limits).

The compact exact coefficient certified in the paper is

```math
C_1=\frac{14995972860899}{244123247301151948800000}
\approx1.0553229\cdot2^{-34}.
```

This is about **4.057 times** the published exact certificate.

## Development history

The recorded progression is `2^-63` → `2^-43` → `2^-36` → `2^-34`, all on October 10,
2026. The first step refined parameters, branch mixing, and rounding; the
second introduced a logarithmic hazard potential and tighter residual
accounting; the third introduced a quadratic potential and integrated
residual bound; the current proof adds joint encoding and the density cutoff. These are superseded bounds within one research effort.
The [improvement record](IMPROVEMENTS.md) links the dated
[intermediate proofs and certificates](archive/README.md), with their original
review status and reproducible checks.

## Reproduce

Python **3.9+**, standard library only:

```sh
python3 -B scripts/run_checks.py
```

This runs five programs: the new scalar and joint-encoding checks, plus the
retained quadratic certificate, reverse-hazard, and ingredient checks, and compares them with the recorded
outputs. It also validates local documentation links and the paper's build
receipt. Run the retained exhaustive small-matroid and arrival-order checks
as well with:

```sh
python3 -B scripts/run_checks.py --full
```

For the new numerical search (discovery evidence, not a certificate):

```sh
python3 -B experiments/search_joint_residual.py
```

Rebuild the PDF with Python and pdfLaTeX, including `amsmath`, `amssymb`,
`amsthm`, `geometry`, and `hyperref`:

```sh
python3 -B scripts/build_manuscript.py > verification/paper_build.json
```

The build uses three passes with shell escape disabled. Its receipt records
source and PDF hashes; byte-identical PDF rebuilds are not promised.
Optionally retrieve the pinned primary sources into the ignored cache,
checking their recorded hashes:

```sh
python3 -B verification/fetch_sources.py
```

## Evidence and review

- [Verification scope and recorded outputs](verification/README.md)
- [Result record](RESULT.md) and [machine-readable current result](results/current.json)
- [Executed approaches](ATTEMPT.md) and [reproduction log](RUNLOG.md)
- [Review questions and next work](HANDOFF.md)
- [Earlier prepared announcement text](announcement.md), not a verbatim posting record

This work was developed with AI assistance using Codex. Same-agent second
passes are not independent peer review. The paper and stable entry points
will be updated as the proof is reviewed or improved; earlier public versions
remain available in Git history.

## License

This project is distributed under the [Apache License 2.0](LICENSE).
See [NOTICE](NOTICE) and [attribution](ATTRIBUTION.md) for provenance;
cited external works retain their own terms.
