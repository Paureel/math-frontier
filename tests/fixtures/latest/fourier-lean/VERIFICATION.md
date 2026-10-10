# Verification record

Toolchain `leanprover/lean4:v4.34.1`, Mathlib `d13f23b723b8a846827a245b89c10fc7d3f11612`.

1. **Clean build from scratch.** All build output deleted, then
   `lake build OAI.Computability.FourierTransform.Main`: 9048 jobs, success, 0 errors. Every project
   file is elaborated and every declaration kernel-checked.
2. **Axioms.** From that build (`lake env lean Check.lean`):
   ```
   'OAI.PowerSaving.transform_improved' depends on axioms: [propext, Classical.choice, Quot.sound]
   'OAI.PowerSaving.convolution_improved' depends on axioms: [propext, Classical.choice, Quot.sound]
   ```
   with `improvedExponent = 1 - 32/10^7`.
3. **No kernel bypass.** No `sorry`, `admit`, `native_decide`, `axiom` declarations, `unsafe`,
   `implemented_by`, `@[extern]`, `debug.skipKernelTC`, custom elaborators/macros, or `#eval` in any
   new or modified file. The finite design data are checked with `decide +kernel` (kernel evaluation).
4. **Independent kernel replay.** `leanchecker` (Lean's bundled replay checker) on every new module
   and every modified OpenAI module, one module per process: 44/44 passed (the 39 modules of the final
   theorem, including the three patched files and `Main`, plus the 5 `GNet*` modules of the 10⁻⁸
   result). A sample of 12 unmodified OpenAI modules also passed. All other OpenAI modules are
   kernel-checked by the clean build.
5. **Statement audit** ([`STATEMENT_AUDIT.md`](STATEMENT_AUDIT.md)). An independent review of what the
   statement means: the DFT definition, the RAM cost model, quantifiers, name provenance (all
   16 477 constants the statement depends on come from Lean/Mathlib, OpenAI's RAM model and `Goal`,
   and the three new definitions), and sanity theorems proved in Lean. Among them, any program
   satisfying `DFTProgram` does at least n work, so the bound is not vacuous. No fatal or serious
   findings. The audit's Lean checks are `lean/Check/Audit1.lean` and `lean/Check/Audit2.lean`.
6. **Unchanged definitions.** `Goal.lean`, `RAM.lean` and `ComparatorChallenges/UniformFourier.lean`
   are byte-identical to OpenAI's. Only `TensorSaving.lean`, `TensorProgram.lean` and `Main.lean`
   differ (see `lean/OPENAI_CHANGES.diff`).

What is trusted: the Lean kernel, Mathlib, and the claim that OpenAI's formal RAM model is a faithful
model of exact computation and its cost.
