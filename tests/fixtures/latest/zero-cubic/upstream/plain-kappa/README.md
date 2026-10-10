# Actual arithmetic development for the cubic boundary

This directory contains the separately pinned Lean development that connects
our cubic boundary to the actual Hecke arithmetic in OpenAI/math. Author:
**Li Xiang / lixiang90**. It is independent of the primary Lean 4.33.0-rc2
library, and its results are counted separately.

**The complete improved zero-free region is still pending.** All 99 selected
roots in the thirty-four authored modules below passed actual compilation, fresh
complete types/axioms and independent Nano replay. The complete patched
low-kappa energy induction and terminal output passed a separate four-root
independent replay. The final source controller compiled all 2281 custom
dependency modules and 37 targets successfully. The previous 2279 successful
modules were reused only after their source/dependency/artifact bindings matched.
The terminal output preserves its arithmetic inputs. The fixed-source
plain_marked field is now proved universally over matching batches. Complete
four-field Moments, improved counts and the physical low/raw-high probe remain open.

## Mathematical scope

The [41-module patch](reviewed-pending.patch) propagates a plain-moment floor
of kappa >= 37/50 through the original reflected and clipping budgets. It keeps
the actual Hecke polynomials, natural coefficients, masks, prime deletions,
moving conductors and the premise 2*HeckeZeroSupremum.beta-1 <= kappa.
The scalar repairs and their scope are described in
[plain-kappa-extension.md](../../docs/plain-kappa-extension.md).
The patch SHA-256 is
`58ddc470f93afd26265525e78b951706ccb202839c6768f7ef39006af699dc42`.
The original d18941bd revision is retained in the historical evidence. Four
final proof-body repairs supply the exact weaker premises expected by existing
APIs; their declaration headers and mathematical hypotheses are unchanged.

The [authored-source manifest](extensions/manifest.json) records thirty-four extra
modules with 99 selected roots separately from those patched upstream sources.
Each has an exact
source hash, declaration list and verification status.

| Interface | What the source proves | Current verification |
|---|---|---|
| ParametersSlotLengthsLowKappa | Distinct positive Fin N slot lengths with any positive total, chosen after the mesh and physical range; a uniform positive lower ratio. | 2 roots passed actual compilation, fresh complete types/axioms and independent Nano replay. |
| LowKappaParameters | Bind the moving moment parameter to the actual Hecke-family supremum. The old family bound beta <= 7/8 stays explicit. | 7 roots passed actual compilation, fresh complete types/axioms and independent Nano replay. |
| GlobalRegionLowKappa | Extend the original local Euler correction to Re x >= 21/25, retaining the 240 Q^(-17/10) majorant. | 5 roots passed actual compilation, fresh complete types/axioms and independent Nano replay. |
| GlobalCorrectionLowKappa | Extend the original globalClosedCorrection and sourceCorrection to the same domain. | 10 roots passed actual compilation, fresh complete types/axioms and the combined 17-root Euler Nano replay. |
| GlobalSourceCorrectionExistenceLowKappa | Choose one finite excluded set before every character and every later half-plane threshold. No L-function zero-free premise. | 2 roots passed actual compilation, fresh complete types/axioms and the combined 17-root Euler Nano replay. |
| Hecke.DirichletLowKappa | Apply the existing actual factorization to transfer an explicit whole-family nonvanishing hypothesis to Dirichlet functions and zeta at any positive threshold. | 2 roots passed actual compilation, fresh complete types/axioms and the combined 49-root Nano replay; the whole-family premise remains explicit. |
| PrincipalSignalScalingLowKappa | Normalize the actual Hecke sourceMultiplier and sourceResidueIntegral at variable total ell and imbalance b; derive the nonzero normalizer from positive windows and slot masses. | 5 roots passed actual compilation, fresh complete types/axioms and the combined 49-root Nano replay after namespace/cast repair. |
| LowSourceScalesLowKappa | Bound the actual compensated lowGramFactor with exponent (1-ell)/4-b/6 and derive the actual physical scale q Z^(1-ell)/L^2. | 9 roots passed actual compilation, fresh complete types/axioms and independent Nano replay after a proof-only positivity repair. |
| PrimeRows.CubeNormalizerLowKappa | Prove the actual positive ray-prime normalizer nonzero and its inverse bounded by every positive power, using the actual slot sum. | 1 root passed actual compilation, fresh complete types/axioms and independent Nano replay, including its actual PNT dependencies. |
| PrincipalSlotEstimateLowKappa and PrincipalSignalComparisonLowKappa | Bound the original marked slots and weighted slotRatio on Re s >= 21/25, with error 1440 Q^(-21/25); prove correction denominators nonzero and the original slotRatio analytic. | 24 roots, including the explicit bounds structure, passed actual compilation, fresh complete types/axioms and the combined 49-root Nano replay. |
| Moments.RayIdentityClassCoefficient | Prove that every actual ray quotient character has coefficient one on identityClass ideals, without extra zero-free premises. | 1 canonical root passed actual compilation, fresh complete types/axioms and the combined 49-root Nano replay. The historical prototype is not a second library module. |
| Moments.FinitePositiveRowDomination | Dominate actual finite positiveSlotRow sums by the same actual energy; derive summability from the proved bounded product. | 1 root passed actual compilation, fresh complete types/axioms and independent Nano replay. |
| Moments.FixedRadialRowDomination | Choose one nonnegative Schwartz radial profile before every finite row set and derive the actual domination for those rows. | 1 root passed actual compilation, fresh complete types/axioms and the joint 3-root replay. |
| Moments.FiniteFamilyNonexceptional | Prove eventual nonexceptionality of all sufficiently large rows for a fixed finite character/ideal family and every admitted nonzero mask. | 2 roots passed actual compilation, fresh complete types/axioms and the joint 3-root replay. |
| Moments.FiberRelativeEnergyBridge | Preserve the actual fiber dictionary, identity-class coefficients, conjugated window, external parameters and masks in a marked-square-to-energy comparison. | 2 roots passed actual compilation, fresh complete types/axioms and the joint 6-root replay. |
| Hecke.FiniteSupportedWitnessRetraction | Extend actual finite supported witnesses to all FreeRows and preserve the complete original witnesses by HEq on retained rows. | 1 root passed actual compilation, fresh complete types/axioms and the joint 6-root replay. |
| Moments.FiniteRowNaturalState | Construct actual NaturalState with a fixed radial profile and keep predicate exactly the supplied finite rows. | 1 root passed actual compilation, fresh complete types/axioms and the joint 6-root replay. |
| Moments.DetectorPairControl | Construct actual detector Profiles and prove the squared control bound C^4(1+norm(t))^(4J), with constants before all profile parameters. | 2 roots passed actual compilation, fresh complete types/axioms and the joint 6-root replay. |
| Moments.FiberPositiveAtLowKappa | Apply the actual PositiveAt interface to the same fiber marked polynomial/product sum, retaining its state, capacity, window, frequency and coprimality gates. | 1 root passed actual compilation, fresh complete types/axioms and the joint 7-root replay. |
| Energy.FiniteLabelPositiveAtLowKappa | Construct actual terminal PositiveAt and unify its constants and eventual threshold for a fixed finite character/ideal family, including the empty-family case. | 1 root passed actual compilation, fresh complete types/axioms and the joint 7-root replay. |
| Detector.ArbitraryTotalSourceBatch | Prove the actual supply condition for any positive slot total Lambda with d<=37*Lambda/7; construct retainedSourceBatchTotal from real supported witnesses. | 2 roots passed actual compilation, fresh complete types/axioms and the joint 7-root replay. |
| Detector.ActualSourceBatchTotal | Obtain the real supported witnesses from the actual source-cube detector gates, then construct the complete source Batch with all data/profile/upper/external identities. | 1 root passed actual compilation, fresh complete types/axioms and the joint 7-root replay. |
| Moments.MarkedHeightBudgetLowKappa | Fix modulus/energy losses before degree and J, then choose the positive height exponent; absorb both actual height factors into U^(1+epsilon_m). | 2 roots passed actual compilation, fresh complete types/axioms and the joint 7-root replay. |

The widened Euler domain is a domain for the **correction factor**, not a
zero-free region for an L-function. The sixfold Mellin pole remains z=1/6,
independently of the variable total slot length. The whole-family hypothesis
in the transfer lemmas and the physical low/high estimates are not supplied by
these identities. See [arithmetic-integration.md](../../docs/arithmetic-integration.md)
for the parameter meanings and remaining interfaces.

## Checked evidence

The slot constructor's fresh audit and serial independent replay checked
**8,647 transitive declarations** from its two roots. The source, configuration,
compiled artifacts and selected build records remained unchanged throughout.
See [slots-total2/strict-replay-result.json](verification/slots-total2/strict-replay-result.json).

All **11 Rellich compatibility patches** also passed real compilation, fresh
types and counted axiom audits, followed by a new independent replay of
**45,863 transitive declarations from 54 roots**. They preserve the mathematical
statements. One original local instance with uninferable proof parameters is
now a same-name lemma, with explicit instances at its two consumers; this
registration change is recorded rather than hidden.
The [compatibility manifest](compat/manifest.json),
[declaration-header comparison](verification/rellich-header-preservation-audit.json)
and [final54 replay](verification/rellich-final54/strict-replay-result.json)
bind the exact sources and checks. The only permitted axioms are `propext`,
`Quot.sound` and `Classical.choice`.

The [moving-parameter replay](verification/lowparams7/strict-replay-result.json)
checked **77,806 transitive declarations from 7 roots**. The
[local Euler replay](verification/region5/strict-replay-result.json) checked
**47,011 transitive declarations from 5 roots**. The combined [global Euler and excluded-set replay](verification/euler17/strict-replay-result.json)
checked **75,322 transitive declarations from 17 roots**, including the five
local Euler roots above. It checks the actual correction functions and one
finite excluded set chosen uniformly before the characters. The four selected geometric
lemmas in the patched ReflectionRetainedLength passed a separate
[17,132-declaration replay](verification/reflection4/strict-replay-result.json).
That four-root scope does not certify the full module or moment induction.

The [principal/Euler/transfer replay](verification/lowkappa49/strict-replay-result.json)
checked **88,593 transitive declarations from 49 roots** across eight authored
modules. The [actual Gram-factor replay](verification/gram9/strict-replay-result.json)
checked **36,287 transitive declarations from 9 roots**. This leaves the full
reflected-energy sum outside its scope. Mathematical declaration headers are
unchanged by the Gram positivity repair; the failed source and exact proof
change remain recoverable in the source history.
The [actual ray-prime normalizer replay](verification/cube1/strict-replay-result.json)
checked **90,764 transitive declarations from its one root**. It proves the
normalizer nonzero and its inverse subpower bound for arbitrary positive slot
lengths, retaining all window and ray-family hypotheses.

The [finite-positive-row replay](verification/finite-positive-row1/strict-replay-result.json)
checks 75,015 transitive declarations from one root. The
[fixed-radial/finite-family replay](verification/finite-family-radial3/strict-replay-result.json)
checks 82,748 from three roots. The
[fiber/state/profile replay](verification/fiber-state-pair6/strict-replay-result.json)
checks 87,870 transitive declarations from the six remaining finite-row roots. Together the authored selected
set contains 78 distinct declarations across the historical 19 modules.
The [source-Batch/PositiveAt/height replay](verification/sourcebatch-positiveat-height7/strict-replay-result.json)
checks the seven new roots across five further modules. The historical authored
24-module checkpoint contains 85 distinct selected declarations. The
[marked-supply replay](verification/marked-supply3/strict-replay-result.json)
adds exactly three roots in three modules, completing the historical
27-module/88-root checkpoint. The [uniform-height replay](verification/uniform-height1/strict-replay-result.json)
adds one further declaration in one module, bringing the authored set to
89 distinct selected declarations across the historical 28 modules.
The [generic ideal/mesh and loss-before-slot replay](verification/generic-losses4/strict-replay-result.json)
adds four roots across two modules, reaching the historical 30-module/93-root
phase boundary. The [universal source/unmarked replay](verification/source-universal-unmarked3/strict-replay-result.json)
adds three roots across two further modules, reaching the historical 32/96
checkpoint. The [source-after-slots replay](verification/source-after-slots3/strict-replay-result.json)
adds three roots in two modules. The current authored set is **34 modules and
99 distinct selected declarations**, with exact source and declaration bindings
in the [integrity record](verification/authored99-independent-evidence-integrity.json).
The 30/93 phase is a frozen intermediate snapshot, not a separate Git commit.
The five additional original OAI sources were restored from exact pinned Git
blobs and compiled without compatibility changes; the original SourceBatch
was a separate compilation target, not an extra independently selected root.

The patched actual induction has a separate
[terminal four-root replay](verification/terminal4-current41/strict-replay-result.json),
checking 101,590 transitive declarations from actual_successor, certified_bands, terminal_certificate and
certified_terminal. The last interface explicitly takes CertifiedBand; the
preceding roots construct it and its actual ZeroAt/PositiveAt estimates.
Separate [reference-state nine-root](verification/reference-state9/strict-replay-result.json)
and [low-branch five-root](verification/reference-low-geometry5/strict-replay-result.json)
records, together with the four reflection roots, bring the distinct upstream
selected set to 22: 21 from modified modules and the unchanged
certified_terminal interface. The latter is bound to its original Git blob. The historical terminal three-root attempt is retained
and is not added to that count.

All replay scopes overlap in foundational declarations and must not be added
together. These proofs establish their listed arithmetic energy interfaces;
the complete improved zero-free theorem remains open. The
[latest frozen build snapshot](verification/latest-actual-module-status.json)
records actual process exits. Earlier records retain their original scopes;
failed elaborations and proof-only repairs are preserved in the history.
The three failed universal-source candidates, their raw logs and the successful
private prototype inputs are retained in the [source-universal history](history/source-universal-prototype-20261009/README.md).
These historical candidates add zero selected roots.

The pinned external file `PrimeNumberTheoremAnd/Wiener.lean` contains the
original placeholders `prelim_decay_2` and `prelim_decay_3`. A fresh axiom audit
of the 17 selected Euler roots reports only the standard three axioms, but
this does not make the entire imported environment placeholder-free. Their
completed 17-root Euler replay contains neither `sorryAx` nor either
placeholder declaration. The separate actual ray-prime normalizer replay likewise excludes both
placeholder declarations and `sorryAx`. The [PNT dependency audit](../../docs/pnta-normalizer-audit/README.md)
records the exact Wiener-Ikehara route and its fresh leaf axiom output; it is
not substituted for the final normalizer proof check.

The [marked-moment audit](../../docs/marked-moment-audit/README.md) identifies
the actual detector/energy dictionary. The new
[finite-row source audit](../../docs/finite-row-energy-audit/README.md) preserves
exact source snapshots and historical prototypes. The
[finite-row integration note](../../docs/finite-row-energy-integration.zh.md)
explains the now constructed radial weight, NaturalState, witness retraction
and fiber energy bridge. The arbitrary-total source Batch now has a proved actual constructor and
fixed finite-label constants are unified. The deterministic height budget is
also proved. The fixed finite-family marked field now constructs its actual
PositiveAt and NaturalState and derives the native capacity. It retains the
real row lower bound, source dictionary, common window/upper, prime
coprimality, scaled slot mesh, external real part and actual height gates.
UniformHeightSourcePlainMarkedLowKappa now uses the native uniform degree
primitive to choose degree/J and a positive common height ceiling before
every finite character/ideal family. Each family has one positive constant
and scale threshold before all 0<tau_prime<=tau. The slots remain fixed first.
LossesBeforeSlotSourcePlainMarkedLowKappa now fixes scalar losses before any
finite Slot type, with degree/J/height before finite character maps.
GenericSourceIdealAndMesh supplies the actual ideal gates and both
absolute-energy and scaled-Batch meshes. The existing source_product_le_rowMask
supplies the mask gate. SourcePlainMarkedUniversalLowKappa
assembles these into the actual source plain_marked field for every matching
q/Batch and nonempty fiber, with S/product ideal fixed before the losses.
LossesBeforeArithmeticSourcePlainMarkedLowKappa now constructs the same
scalar losses before every ideal/subgroup and finite Slot type.
SourceAfterSlotsPlainMarkedLowKappa then constructs physical slots before
every positive detector e and prime seed, and calls the actual
Parameters.exists_fixed_source to obtain SourceExclusions and FirstTail(4e).
The resulting prime set has a nonzero product and supplies the same universal
marked source field, with degree/J/common height before outer characters.
The original [order audit](../../docs/source-assembly-order-audit/audit.md)
remains historical; its [later status](../../docs/source-assembly-order-audit/README.md)
records the proved interface and the still-open full HighData budgets.
PlainUnmarkedAdmissionLowKappa proves the genuine max(1,2m) admission without
marked capacity, retaining actual PositiveAt, state.width=d*max(1,2m)+rho,
state-width/polynomial-scale caps and radial cover. Its source-wide state and
uniform caps still need to be constructed. inverse_raw, inverse_marked,
the complete four-field record, improved counts and the physical probe remain open.

The [marked-supply replay](verification/marked-supply3/strict-replay-result.json) checks these three further interfaces:

| Interface | Proved scope |
|---|---|
| Moments.PlainMarkedAdmissionLowKappa | Derive native energy capacity and the polynomial-length cap from actual selected-slot capacity; absorb the exact degree+4J height growth. |
| Energy.UniformDegreePositiveAtLowKappa | Construct native PositiveAt with degree and finite seminorm set before every character and ideal; constants and thresholds may depend on those arithmetic inputs. |
| Moments.EventualFiniteSourcePlainMarkedLowKappa | Construct PositiveAt and NaturalState and prove the eventual marked bound for every fiber admitted by a fixed finite character/ideal family and the genuine row/slot/prime/height gates. |

The further Moments.UniformHeightSourcePlainMarkedLowKappa root passed actual
compilation, complete fresh types/axioms and its own [one-root independent replay](verification/uniform-height1/strict-replay-result.json).
Its degree/J/common-height witnesses precede arbitrary finite character/ideal
maps for fixed slots; the actual row/slot/prime/height gates remain explicit.

Each of the preceding three roots passed actual compilation, fresh complete types/axioms and the same joint independent replay. The last interface still fixes its finite maps before degree; the independent uniform-degree primitive does not silently strengthen that statement.

The [source-wrapper audit](../../docs/source-plain-wrapper-audit/README.md)
preserves the historical admission dictionary. The new seven selected roots
have their own completed fresh audits and independent replays:

| Interface | Proved scope | Roots |
|---|---|---|
| Moments.GenericSourceIdealAndMesh | Actual fixed product/internal ideal gates; arbitrary-total slots satisfying both absolute energy and scaled Batch meshes; actual fiber absolute width. | 3 |
| Moments.LossesBeforeSlotSourcePlainMarkedLowKappa | Scalar losses before arbitrary finite slots, then degree/J/common height before every finite character/ideal family. | 1 |
| Moments.SourcePlainMarkedUniversalLowKappa | For fixed S/product ideal and window, construct losses and slots and prove the moving-kappa marked bound universally for every matching source q/Batch and nonempty fiber. | 1 |
| Moments.PlainUnmarkedAdmissionLowKappa | Principal-exponent height absorption and actual empty-selected unmarked admission at exponent max(1,2m), retaining real state and caps. | 2 |

The first four-root replay checked 101,887 transitive declarations; the last
three-root replay checked 101,944. Their closures overlap and are not added.
The SourcePlainMarkedAt predicate is not an additional selected root. Both
replays bind complete types and the three standard axioms; the selected exports
contain neither the disclosed PNTA auxiliary placeholders nor sorryAx.
The [assembly-order audit](../../docs/source-assembly-order-audit/audit.md)
binds eight original source snapshots and adds zero proved roots.
The subsequent [source-after-slots replay](verification/source-after-slots3/strict-replay-result.json)
checks the strengthened native loss-order root and both actual source-after-slots
roots. No prepared candidate or read-only audit is counted as an extra root.
The final source set and detector e are chosen in the order stated by these
complete types; the other HighData budgets and the complete Moments record
are not asserted.

## Pinned sources and tools

| Component | Pin |
|---|---|
| OpenAI/math | `fd4aeeb2ee4fc729c18d98444fed42fd0529eeeb` |
| Lean | `leanprover/lean4:v4.34.1` |
| Mathlib | `d13f23b723b8a846827a245b89c10fc7d3f11612` |
| Rellich-Kondrachov | `70f85d4c1bf99c6e7d61e8be4daa6f3664d08d23` |
| PrimeNumberTheoremAnd | `c39a751132c88b6e8080b74c74023fd95b3d8be0` |
| lean4export | `b18d673bd29b476466a51a3be1012df2ed322b10`, built with Lean 4.34.1 |
| Nano | `418320295890faed83a96fd97907b12a3b6728c2`, serial replay |

The [Lake manifest](template/lake-manifest.json) fixes the full dependency
versions. Original OAI files are read from pinned Git blobs. Authored modules
are explicitly labelled `authored_extension` and have no fabricated upstream
Git baseline. Source preparation checks every patch and rejects unlisted
changes or missing custom imports. The original math checkout is unchanged.

## Reproduction

With Elan, Python 3.10+ and a clone containing the pinned math commit, run from
this directory, choosing a new empty destination:

```sh
python prepare_low_kappa_capsule.py --source /path/to/math --destination /new/empty/plain-project --patch-manifest manifest.json --external-compat-manifest compat/manifest.json --extension-manifest extensions/manifest.json --install --build --jobs 4
```

For a public partial clone at an absent source path, add `--fetch`. Omit
`--install --build` to verify source reconstruction only. The recorded fixtures
under verification/ distinguish this preparation pass from a proof check.

The default `--jobs 1` is serial. Bounds of 2, 4 or 8 run that many Lean child
processes at most, with two Lean threads each. There must be one source-build
controller for a project. It checks source/dependency fingerprints and artifact
hashes, drains current tasks after a failure, and supports
`.serial-build/stop-after-current.flag` for a safe checkpoint. Existing successes
are reused only when their bindings still match.

After a selected target has compiled, the
[current strict multi-target replay runner](kernel-tools/run_upstream_nanoda_multitarget_v3.py) checks its actual
custom dependency closure, freshly prints `#check @` types and transitive
axioms for every selected root, and invokes the pinned exporter and serial
Nano. It requires the Lean 4.34.1 exporter; the primary project's 4.33 exporter
is a different toolchain. Its commands and byte bindings are retained in each
strict replay record and in
[kernel-toolchain-provenance.json](kernel-tools/kernel-toolchain-provenance.json).
All stages must pass for a target to be labelled independently verified.
Version 3 permits exactly the two hash-pinned, unselected PNTA auxiliary
warnings above, and still rejects any such declaration or `sorryAx` in the
selected export. Earlier runners and failed preflight records remain archived.

The upstream OAI Apache-2.0 license is preserved at
[third_party/OAI-LICENSE](../../third_party/OAI-LICENSE); the external package
license is [Rellich-LICENSE](licenses/Rellich-LICENSE).
