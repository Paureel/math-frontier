# Formalization status

Local Lean filenames below are relative to `lean/`. Verification commands
run from the repository root.

The theorem is nonvanishing for `Re(s) > 4374785349/5000000000`.
`OAIHighUnconditional.lean` proves it in Lean without a moment hypothesis
or an assumed prior zero-free bound. The declarations in
`OAI.SevenEighths.PerturbedZeroFree` are:

- `bound_zero_supremum`: `beta ≤ 4374785349/5000000000`.
- `prove_hecke_nonvanishing`: finite-order Hecke L-functions over the
  Eisenstein field, apart from the principal pole.
- `prove_dirichlet_nonvanishing`: Dirichlet L-functions for every positive
  modulus, apart from the principal pole.
- `prove_zeta_nonvanishing`: the Mathlib Riemann zeta function.

The upstream checkout is revision
`adc7f1241b42e322a6451854ab7e4b4c146bf78a` of `openai/math`.
Run `uv run scripts/verify_oai.py OAIHighAudit` to rebuild the local dependency
chain and check the theorem types and their axioms. The verifier requires
the pinned upstream commit and a clean upstream working tree. `ProofAudit.lean`
rejects transitive axiom dependencies outside `propext`, `Classical.choice`,
and `Quot.sound`, so an incomplete proof or an added axiom fails the audit.

`BoundsReal.lean` proves the changed geometry, signal exponent, low margin,
low scale conditions, reflected-row loss inequality, and Euler-region
numerical margins over real numbers. `ReflectedExponent.lean` generalizes
the source's reflected-exponent calculation to the new slot length and proves
the extra positive-part loss. `EndpointCertificate.lean` proves the
source endpoint polynomial identity, its lower bound, its equality with the
high-bin exponent at the original geometry, and an exact perturbed
high-endpoint margin of `1/1250000000000`. The certificate includes the asymmetry
`k = 12457523527/15625000000000`, clears the positive balance denominator,
and completes a square in the detector parameter. Its remaining polynomial
has positive coefficients. `OAIAsymmetricGeometry.lean` defines the exact
geometry and proves the signal exponent `s-11/16+k/3`. The low margin is
`831/1000000000000000` at slot-length increase `42930200831/250000000000000`.

The local project uses Lean 4.34.1 and the upstream Mathlib revision
`d13f23b723b8a846827a245b89c10fc7d3f11612`. `lake build` from `lean/`
compiles these three files and `LowGramScale.lean` without `sorry` or new
axioms.

`LowGramScale.lean` proves the compensated Gram-factor inequality at the
changed physical scales. It also proves that a fixed slot-product cap
`L ≤ B Z^slotLength` eventually meets the required Gram condition
`L ≤ Z^(2*xLength-yLength)`.

The normalized compensated low estimate for the changed physical probe is
proved in Lean. `OAIHighEulerRegion.lean` proves the unramified local
Euler defect bound at `Re(s) ≥ 4374785349/5000000000`, with decay
`240 Q^(-363/200+643953/2500000000)`. `OAIHighPrincipalProduct.lean` proves that,
after excluding finitely many small primes, the actual principal Euler
correction is analytic and within `1/2` of `1` on the larger open region.
`OAIHighRamifiedBound.lean` proves the corresponding `193` bound for the
row-dependent ramified local factor at the new boundary. This carries the
changed lower bound through the marked-term, finite-sum, and closed-factor
estimates. `OAIHighHolomorphic.lean` proves that the unramified and
ramified local factors are analytic in each contour variable on the
corresponding enlarged region.
`OAIHighGlobalRegion.lean` proves a summable `240 Q^(-5/3)` defect bound
on the larger three-variable region needed for the contour shifts.
`OAIHighGlobalCorrection.lean` uses it to give the actual global Euler
correction a finite-prime cutoff, a uniform `1/2` defect bound, and
analyticity in each contour variable there. Its stronger tail condition
implies the original source tail condition.
`OAIHighSlotEstimate.lean` extends the actual compensated slot factor to
the new boundary. `OAIHighFiniteProductBounds.lean` bounds the finite
multiplier for nonnegative real weights. `OAIHighFiniteProductX.lean`
proves the continued source multiplier is analytic in the enlarged
`x` strip. `OAIHighFixedSource.lean` chooses one finite prime set satisfying
all source and enlarged Euler-tail conditions. `OAIHighFiniteProductWZ.lean`
and `OAIHighSourceWZ.lean` prove the corresponding `w` and `z` analyticity.
`OAIHighComplexSlotBounds.lean` bounds the original finite multiplier for
arbitrary complex weights on the enlarged region. `OAIHighSourceContours.lean`
uses this to prove the original source's `w` and `z` boundary controls and
residue contour shifts for `Re(s) ≥ 4374785349/5000000000`.
`OAIHighArithmeticLines.lean` carries the complex multiplier bound into
the joint contour-line amplitude, joint integrability, Fubini exchange,
and slice estimates. `OAIHighOrderedContours.lean` proves the ordered
principal `w` and `z` double shift at fixed height and almost everywhere
on the new boundary.
`OAIHighResidueBounds.lean` and `OAIHighOuterContours.lean` carry the
residue pair and ordered outer identity. `OAIHighUniformTails.lean`,
`OAIHighHighSlices.lean`, and `OAIHighResidueMoments.lean` prove the
uniform joint tails, raw high slices, and residue tails needed to pass
contour limits.
`OAIHighXTransport.lean`, `OAIHighZTransport.lean`, and
`OAIHighTripleTransport.lean` prove the principal triple-contour moves
from the initial lines to the enlarged region. `OAIHighInitialPlacement.lean`
combines them with the ordered residue shift at any
`4374785349/5000000000 < a ≤ 3` above the Hecke zero supremum.
`OAIHighSelectedTerms.lean` through `OAIHighSelectedLocal.lean` extend the
actual row-dependent selected Euler factors on the first Euler region.
`OAIHighSelectedSlotSums.lean` proves the weighted selected-prime slot
estimate and `OAIHighWGrowth.lean` proves calibrated physical-row growth
on the left `w` line.
`OAIHighNonprincipalShift.lean` carries the nonprincipal `w` contour move.
`OAIHighTupleSums.lean` through `OAIHighDyadIntegral.lean` bound the actual
selected tuple, physical row dyad, and its Mellin integral on the enlarged
boundary. `OAIHighFixedIntegral.lean` through `OAIHighPhysicalDyad.lean`
prove the row integral exists and identify finite physical rows with the
contour integral there. `OAIHighTailScales.lean`, `OAIHighSmallDyad.lean`,
`OAIHighSmallTail.lean`, and `OAIHighLargeDyad.lean` carry the changed
physical lengths through the small-row bound and the large-row dyad bound.
`OAIHighLargeTail.lean` and `OAIHighLargeSaving.lean` sum the outer-row
dyads with arbitrary power saving at the changed high-row threshold.
`OAIHighCentralCrude.lean` and `OAIHighCentralFiniteError.lean` carry the
changed row threshold, physical lengths, and prime-tuple count through
the central rectangle truncation error.
`OAIHighEndpointCertificate.lean` proves the exact endpoint certificate
using the upstream balanced exponent and row-count definitions.
`OAIHighCentralExponent.lean` applies it for `δ ≤ 3/4` and
`0 ≤ t ≤ 42930200831/250000000000000`. Its saving budget charges
`(13/16-k+3*t/2)*countLoss + 2*ζ + 3*μ/2` for the row count, frequency
extension, and row-scale slack. It also includes the real-contour losses
and the additional physical-scale cost `t*(3*e+mesh)+6*k*e`.
`OAIHighCentralSlotExponent.lean` through `OAIHighCentralCollected.lean`
carry this bound through the actual amplitude batches, source row count,
finite central integral, normalizer, and dyadic collection. The resulting
small-row bound takes the `SourceMomentsAt` fourth-moment input at the
changed slot lengths, zero moment excess, and detector heights as a
hypothesis. `OAIHighMomentTransport.lean` supplies it.
`OAIHighSlotLengths.lean` constructs distinct positive slots with any
positive total mass and the physical width bounds. `OAIHighCentralBudget.lean`
chooses a small parameter below any positive zero gap and proves that the
perturbed detector budget has room for the fixed length increase.
`OAIHighData.lean` packages positive slot lengths of total
`1/6+42930200831/250000000000000`, detector scales, the new row threshold, and the central
and floor budgets for every positive zero gap. It proves that such data exist.
`OAIHighFloorArithmetic.lean` through `OAIHighFloorCollected.lean` carry the
floor tuple estimate through dyadic summation, the changed physical scales,
normalization, and collection by detector height. The floor budget includes
the added cost `t*(121/40+3*e+mesh)+k*(67/100+6*e)`.
`OAIHighPhysicalSmallTail.lean` through `OAIHighCanonicalRayCube.lean`
assemble the perturbed small- and large-row tails, cube truncation error,
and the canonical ray-cube bin choice. Their common geometry uses
`17/48+k-t/2`, `23/48-k-t/2`, slot mass `1/6+t`, and row cutoff
`13/16-k+3*t/2+ζ`. The small-row saving is
`63/800-51*t/100-49*k/150`.
`OAIHighSignalShift.lean` through `OAIHighPrincipalActualBound.lean` prove
the principal slot-ratio and normalized residue estimates on the new
boundary. The asymmetric principal kernel carries the factor `Z^(k/3)`
required by the shifted signal. `OAIHighPrincipalScale.lean` through
`OAIHighPrincipalPhysicalRemainder.lean` prove the physical principal
remainder at the changed lengths with saving `1/4000` on the fixed
contour just right of `7/8`. `OAIHighPrincipalWindow.lean` through
`OAIHighPrincipalNormalized.lean` carry the contour to `β*+e` and prove
the normalized principal comparison. This retains a `1/3000` power saving
relative to the zero supremum when it lies between the proposed boundary
and `7/8`.
`OAIHighNormalizedTransport.lean` through `OAIHighFromMoments.lean` prove
the normalized probe transport and the raw-moment-to-probe estimate with
the perturbed physical scales. `OAIHighAssemblyClass.lean` through
`OAIHighAssemblyFixedHigh.lean` carry the selected count parameters into
the concrete detector data. `OAIHighSignalIdentity.lean` and
`OAIHighCommonProbe.lean` prove the continuation contradiction at the new
boundary. `OAIHighAssemblyFinal.lean` concludes `β* ≤ 4374785349/5000000000` and
the Hecke, Dirichlet, and zeta nonvanishing claims from
`ChosenPerturbedMomentInput` and `β* ≤ 7/8`. It also states versions that
take the raw moment input. `OAIHighData.lean` selects slots fine enough for
any positive moment mesh, and `OAIHighAssemblyMomentInput.lean` derives the
chosen input from a `FinePerturbedMomentInput`.
`OAIHighMomentTransport.lean` proves that fine input from `β* ≤ 7/8`.
`OAIHighUnconditional.lean` derives the prior bound from the upstream
`FinalAssemblyUnconditional.detector_certified_bands` theorem, then
discharges both hypotheses of the perturbed assembly.
Run `uv run scripts/verify_oai.py OAIHighAudit` to check this chain against upstream
OAI and audit its axioms. The audited results report only `propext`,
`Classical.choice`, and `Quot.sound`.
`uv run scripts/run_comparator.py` checks the Hecke, Dirichlet, and zeta
statements in `lean/comparator/PerturbedQuasiRiemann.lean` with Comparator.
The Hecke definitions in that challenge are upstream's
`ComparatorChallenges/HeckeSevenEighths.lean` verbatim.

The perturbed moment input asserts fourth-moment estimates with zero moment
excess, slot mass `1/6+42930200831/250000000000000`, and detector labels at most `7/8`.
`OAIHighMomentGeometry.lean` proves the normalized slot bounds and the
selected-capacity equivalence at the asymmetric row scale. `OAIHighMomentCertificate.lean`
obtains `κ=3/4` from the previously proved `β*≤7/8` alone, then
`OAIHighMomentEnergy.lean` proves the
generic certified energy band and its positive and zero field bounds at
`κ=3/4` when `β*≤7/8` in the perturbed contradiction range.
`OAIHighMomentTransport.lean` transports those field bounds to the actual
`SourceMomentsAt` batches. Its supporting modules prove:

- Disjoint prime supports and coefficient bounds for the distinct perturbed
  slot lengths, followed by the inverse raw and marked moment fields.
- Bounded norm for exceptional sixth-power-free rows, so they are absent
  from the retained detector range for sufficiently large scales.
- The equality between the physical plain witness products and the
  retained energy source, with the fixed ideal and conductor deletions.
- Admission of marked states at width `1 + small/4` and unmarked states
  at width `max 1 (2*m) + small/4`, using stage error `small/4`.
- Uniform polynomial height bounds for all required profiles, assembled
  into the source moment estimate with zero excess.

The positive energy mesh depends on `small`, and the slot construction
ensures `ell j ≤ mesh/200`. Since `d ≥ 1/200`, every batch width
`ell j/d` lies within that mesh. This allows total slot mass
`1/6+42930200831/250000000000000`. The original `RawMomentInput`, which applies under
`β* > 7/8` with excess `β*-7/8`, is not used as the perturbed moment input.

The local low-side chain replaces the upstream declaration
[`compensatedPhysicalProbe_low`](https://github.com/openai/math/blob/main/lean/OAI/NumberTheory/DirichletL/Detector/LowCommonBound.lean).
It assumes the total slot length is at most `1/6` and concludes with the
fixed exponent `3/16`. The new probe has total length `1/6 + 42930200831/250000000000000`.
Its caller in `LowNormalized.lean` also fixes the original physical scales
`17/48` and `23/48`. The existing theorem cannot be applied to the new
probe, even though `BoundsReal.lean` proves the required numerical margins.
The `OAILow*.lean` files compile against upstream OAI with Lean 4.34.1.
They carry the changed parent exponent and surviving slot length through
reflected row energy, physical dyads, slot choices, completed rows, and
detector selected-row energy. The changed physical scale `Z^(5/6-t)/L²`
cancels the matching row-energy exponent after taking square roots. A sharper
slot-mass estimate retains a factor `Z^(-d)` for a rescaled subset of length
`d`. This absorbs the reflected-row loss in the central tuple. The central
and remote Gaussian dyads, common physical probe, original ray pools, and
normalizer are all proved for `0 ≤ t ≤ 1/30` and total slot length
`1/6+t`. `OAILowNormalized.lean` concludes with normalized bound
`Z^(3/16+k/3-t/4+loss)` for every positive `loss`. Run
`uv run scripts/verify_oai.py OAILowAudit` to rebuild the source-connected chain
and audit its axioms. The audit reports only `propext`, `Classical.choice`,
and `Quot.sound`.
The upstream `Reflection/LowOriginalEnergy.lean` assumes both `d ≤ 1/6`
and `ell0 ≤ 1/6-d+η`, and bounds parent norms using `5/6-2*d`. The new
probe needs `d ≤ 1/6+42930200831/250000000000000`, surviving length
`ell0 ≤ 1/6+42930200831/250000000000000-d`, and parent exponent
`5/6-42930200831/250000000000000-2*d`. The old theorem cannot yield the needed power saving
by setting its loss parameter `η` as large as the slot-length increase.

The [existing final assembly](https://github.com/openai/math/blob/main/lean/OAI/NumberTheory/DirichletL/Detector/FinalAssembly.lean)
starts with the assumption `7/8 < β*`. The perturbed assembly uses a
separate moment input and the row scale `13/16-k+3*t/2`.
