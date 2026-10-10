# An improved exponent for the exact power-saving DFT (formally verified)

**Main result.** There is a single deterministic algorithm which, for every n ≥ 1 and x ∈ ℂⁿ,
computes the discrete Fourier transform Fₙx exactly in

> **O(n (log n)^{1 − 3.2·10⁻⁶})** operations,

in the exact-arithmetic model of OpenAI's paper *An explicit power saving for the exact discrete
Fourier transform* (which proves 1 − θ ≈ 2.1·10⁻¹³; its Lean formalization proves 1 − 2·10⁻¹¹).
The same holds for exact convolution.

The result is **formally verified in Lean 4 / Mathlib**, as an extension of OpenAI's open
formalization ([github.com/openai/math](https://github.com/openai/math)). The final theorem uses only
the standard axioms `propext`, `Classical.choice`, `Quot.sound` (no `sorry`, no `native_decide`).

- Paper: [`paper/paper.pdf`](paper/paper.pdf) (LaTeX source alongside).
- Lean proof: [`lean/`](lean/).

## The two ideas
1. **Grouped recursion.** OpenAI's recursion runs every directional factor of their finite network as a
   separate recursive call. All factors of one *edge* of the network form a single tensor power and can
   be run as one call on a larger fibre. The exponent becomes the root of Σₑ(ρₑ/m)ᵖ = W* instead of
   log_m(Σₑρₑ/W*). On OpenAI's own formalized network alone this gives O(n (log n)^{1−10⁻⁸}).
2. **Colour registers.** A new network in which most of the paper's side wires (one per ordered pair
   of orthogonal triples) are replaced by a few shared registers meeting at common labels, with
   searched register designs. Factor sizes (30, 20, 41), 2⁴³ roles, 24 600 coordinates.

## Verifying the Lean proof
Requirements: [elan](https://github.com/leanprover/elan) (the toolchain `leanprover/lean4:v4.34.1` is
pinned in `lean/lean-toolchain`; Mathlib is fetched by Lake).

```bash
cd lean
lake exe cache get        # download prebuilt Mathlib
lake build OAI.Computability.FourierTransform.Main
lake env lean Check.lean  # prints the statement and its axioms
```

Expected output of `Check.lean` (abridged):

```
OAI.PowerSaving.transform_improved : OAI.PowerSaving.ImprovedGoal
def OAI.PowerSaving.ImprovedGoal : Prop :=
∃ order solve W, DFTProgram order solve W ∧ TimeBounds W ∧ (fun n => ↑(W n)) =O[atTop] improvedTime
def OAI.PowerSaving.improvedExponent : ℝ := 1 - 32 / 10 ^ 7
'OAI.PowerSaving.transform_improved' depends on axioms: [propext, Classical.choice, Quot.sound]
```

A self-contained statement for OpenAI's comparator tool is in
`lean/ComparatorChallenges/ImprovedFourier.lean` (+ `.json`): OpenAI's challenge file with the three
new definitions (`improvedExponent`, `improvedTime`, `ImprovedGoal`) and the two theorems.

`DFTProgram` and `TimeBounds` are OpenAI's definitions, unchanged (file
`OAI/Computability/FourierTransform/Goal.lean` and OpenAI's challenge statement
`ComparatorChallenges/UniformFourier.lean` are byte-identical to OpenAI's). `improvedTime n = n·(log n)^improvedExponent`.

## What is new
- `OAI/Computability/FourierTransform/Grouped/`: the grouped recursion (batch identity, batch addressing
  in OpenAI's RAM model, multi-size recursion, the work bound), and the grouped certificate of OpenAI's
  own network.
- `OAI/Computability/FourierTransform/Colour/`: the colour-register network (scalar identity, labels,
  stages, certificate), the cyclic sunflower design, the searched coordinate designs as kernel-checked
  data (`Colour/Designs/`), the exponent inequality, and the final assembly (`Colour/Final.lean`).
- The `Grouped/GNet*.lean` modules are the grouped certificate of OpenAI's own network (the 10⁻⁸ result,
  Theorem 1.2 of the paper). They are not imported by the final theorem; build them with
  `lake build OAI.Computability.FourierTransform.Grouped.GNetRate`. The end-to-end 10⁻⁸ theorem uses
  the same three-file patch with that certificate in place of the colour one.
- Three of OpenAI's files are modified, at the interface between the network and the recursion:
  `TensorSaving.lean`, `TensorProgram.lean`, `Main.lean`. The complete diff is
  [`lean/OPENAI_CHANGES.diff`](lean/OPENAI_CHANGES.diff).

## License
OpenAI's formalization is licensed under the Apache License 2.0
([`lean/LICENSE-OpenAI-Apache-2.0`](lean/LICENSE-OpenAI-Apache-2.0)); see [`NOTICE`](NOTICE) for the
modifications. The new material is released under the same license.
