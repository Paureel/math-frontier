# Formalization status and remaining arithmetic obligations

## Completed implications

The root is constructed by the intermediate value theorem. Its uniqueness,
strict isolation and every comparison use exact rational inequalities.

Q0 is exactly zero modulo the cubic. Lean verifies Q1 through Q4 are positive
and proves Q(y) >= 0 for all y >= 0. Square completion proves the continuous
quadratic inequality, and the positive denominator gives the reference endpoint.

Feedback follows an exact finite-difference identity for the rational count,
with positive denominators and a uniform coefficient bound. No derivative or
Lipschitz estimate is assumed. Main connects its parameter to kappaStar and
the certificate's polynomial inverse.

The generic continuation proves convergence and analyticity of an actual
Mellin integral, propagates a product identity, and obtains nonvanishing.
Family.SignalData records actual functions, integrability, decay, estimates,
multiplier control and the identity. No zero-free conclusion is a field.
The family proof uses the supremum with a 1/2 sentinel and does not assume
there is a zero at the supremum.

The standard facts for actual zeta are now proved, rather than supplied as
signal fields: its zero-real-part set is bounded by 1, its removed-pole
function is entire, its value at one is the proved residue, and its
regularizer is nonzero away from one.

HeightClosure chooses tau before N and proves that the raw estimate
C_N [x^(beta+c-m)(1+T)^A + x^B T^(-N)] gives error O(x^(beta+c-m/2)).
A and B are independent of N. The same m/2 works for a family even when
its constants, tau and N differ by member.

ZetaInverse constructs the principal signal explicitly as
x^c * mellinInv(-2, exp((s-5/6)^2) H(s)/zeta(s) reflected in s).
The reciprocal bound in Re(s)>=2 follows from the Moebius Dirichlet series.
Gaussian contour shifting proves arbitrary power decay at zero. Fourier
continuity proves local integrability. Mellin inversion and the identity
theorem prove the initial-half-plane product identity once the signal's
upper growth bound is derived from the low/raw-high probe estimates.

SourceScaling proves the principal complex-power identity for
lx=(1-ell-b)/2 and c=-(4+b)/6. Dividing the source expression by the slot
normalizer Z^(-ell/6) gives exactly Z^(s+c) times the amplitude of the
constructed zeta signal. This also equals the paper's shift
lx/2-1+h/6, where h=(1+3*ell+b)/2. Its low exponent is
sigmaStar+c=(1-ellStar)/4-bStar/6. The intrinsic sixfold Mellin pole
z=1/6 and Gaussian center 5/6 remain fixed; the variable total slot length
ell does not replace them. This identity does not supply the physical
source residue theorem or the arithmetic low/raw-high bounds. The separate
4.34.1 PrincipalSignalScalingLowKappa module now checks the actual
sourceMultiplier and sourceResidueIntegral normalization; its precise
verification scope is recorded in the arithmetic capsule.

## Open obligation

`ZeroFree.ZetaSignalObligation` is a proposition, not an axiom declaration or
a proved theorem. It requires a bounded zero-real-part set and, under the
contradiction sigmaStar < beta, actual uniform signal data for Mathlib's zeta.
`riemannZeta_ne_zero_of_cubic_signal` takes it explicitly and excludes s = 1.

The sharper remaining input is
`ZeroFree.ZetaInverse.ArithmeticProbeObligation`: under sigmaStar < beta,
construct the analytic correction H close to 1 and an actual physical probe J,
prove its low bound, and prove the raw high estimate against the explicitly
constructed inverse Mellin signal. Integrability, decay, pole removal,
boundedness and the Mellin identity no longer need to be provided as fields.
It remains a proposition with no proved inhabitant. The theorem
`riemannZeta_ne_zero_of_arithmetic_probe` takes it explicitly.

The complete actual low-kappa energy induction now passed compilation and
independent replay through `actual_successor`, `certified_bands`,
`terminal_certificate` and `certified_terminal`. These declarations retain
all moving conductor, natural coefficient, mask and profile data, together
with beta>=51/100, kappa>=37/50 and 2*HeckeZeroSupremum.beta-1<=kappa.
The last interface takes the terminal CertifiedBand as a premise; the preceding
certificate constructs that premise. Their actual ZeroAt/PositiveAt output
is an energy estimate, not a complete detector Moments record.

An unconditional improved-region theorem still requires kernel-checked proofs of:

1. Instantiate the terminal energy with the actual canonical finite detector
rows and supply the complete four-field Moments record. The new finite-row modules
construct the radial profile, NaturalState and witness retraction and prove
the actual fiber-to-energy dictionary. ActualSourceBatchTotal now constructs
the source Batch for arbitrary positive total length from the actual detector
and row gates. Finite-label PositiveAt constants and deterministic height
absorption are proved. EventualFiniteSourcePlainMarkedLowKappa now constructs
the actual state and PositiveAt and proves the fixed finite-family marked
field under its genuine row/slot/prime/height gates.
LossesBeforeSlotSourcePlainMarkedLowKappa now chooses scalar losses before
any finite Slot type. GenericSourceIdealAndMesh supplies the actual ideal
and absolute/scaled mesh gates. SourcePlainMarkedUniversalLowKappa proves
the fixed-source plain_marked field for every matching q/Batch and nonempty
fiber; degree/J/common height precede outer characters and each character's
constant/threshold precede all smaller admitted heights and batches.
That earlier theorem fixes S/product ideal first. The new
LossesBeforeArithmeticSourcePlainMarkedLowKappa constructs scalar losses
before every M/H and Slot type. SourceAfterSlotsPlainMarkedLowKappa chooses
losses and actual slots before a later positive detector e, then constructs
SourceExclusions, FirstTail(4e) and a nonzero product modulus. The universal
marked field retains degree/J/common height before outer characters.
This discharges the specific slots-before-final-S gate. It accepts a later
genuine detector e; it does not construct the remaining HighData budgets or
the complete SourceData/Moments assembly. The [historical order audit](source-assembly-order-audit/audit.md)
and [current status](source-assembly-order-audit/README.md) distinguish these scopes.
PlainUnmarkedAdmissionLowKappa proves actual admission with exponent
max(1,2m), retaining PositiveAt, state.width=d*max(1,2m)+rho and real
state-width/polynomial-scale caps. The source-wide state and uniform caps,
inverse_raw and inverse_marked remain separate requirements. The complete
four-field Moments record is still open.
2. The flexible compensated probe for new lx, ly, h and e, including its
actual reflected-energy estimate. The new lowGramFactor and physical-scale
extension proves the variable-exponent scale gate; the full low-probe bound
requires the reflected sums as well as this factor.
3. The complete four-field Moments record, its improved detector-count consumers and all
physical small/middle/floor/outer estimates. The actual Euler correction and
one finite excluded set chosen before all characters passed independent
replay. Principal-slot comparison, residue normalization and positive
ray-prime normalizer have separate verification records; none supplies the
missing complete physical estimate.
4. The physical probe and correction with their actual low/raw-high estimates.
For zeta, the principal signal, Mellin identity, and height/tail-order closure
are proved. Extending this construction to the intended Hecke family remains open.
5. Concrete finite-order Hecke-family instantiation and its whole-family
nonvanishing premise. The actual Hecke-to-Dirichlet/zeta transfer at a variable
positive threshold is checked with that premise explicit; the premise is not
proved by the transfer.

The paper's imported package R supplies the underlying written inputs. This
repository has not formalized its full package or proved
`R -> ZetaSignalObligation`. Conditional analytic theorems and unconditional
real algebra remain separately classified.

## Paper-to-code mapping

| Paper section | Formal coverage |
|---|---|
| Root and comparison | Boundary, complete. |
| Extended plain moment | Scalar budget/slack in Geometry; separate actual low-kappa energy induction and terminal output independently checked. Universal plain_marked and slots-before-FirstTail-S are checked; full HighData/four-field/source assembly remains open. |
| Inverse/plain counts | Rational envelope and feedback in Feedback; arithmetic realization open. |
| Probe and low estimate | SourceScaling checks complex-power normalization and its zeta-amplitude identity; separate actual source normalization and Gram-factor scale gates are available. Full reflected sums and the complete probe estimate remain open. |
| Continuous reference certificate | Certificate plus Main, complete for the stated envelope. |
| Actual parameter feedback | Feedback plus Main, complete. |
| Physical admission/Euler/outer rows | Exact margins/identities; actual Euler correction and uniform exclusions independently checked. Complete physical and outer-row estimates remain open. |
| Uniform continuation | Mellin implication and family contradiction proved; actual zeta inverse signal, identity, origin decay and height closure proved; arithmetic probe estimates and the concrete Hecke family remain open. |

## Verification interpretation

`checked: true` in a build/replay record certifies only its listed declarations
with their complete types. Records leave
`complete_arithmetic_zero_free_proof: false` until the open input is constructed.
Analytic hypotheses are never hidden as global axioms. The historical Python
audit certifies displayed finite algebra and is outside the Lean proof.
