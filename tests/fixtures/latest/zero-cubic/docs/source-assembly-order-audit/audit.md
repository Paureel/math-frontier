# Source selection versus scalar losses and physical slots

The new universal plain-marked theorem is mathematically valid for its fixed
S/M/H/W scope. A complete source assembly using the original FirstTail budget
needs an additional true interface: scalar losses and physical slots before
the final S/M selection. This is a quantifier-order integration issue, not a
failure of the checked one-field theorem or its analytic correction proof.
This audit is read-only; no Lean, controller, formal source or export is run.

## Two different exclusion requirements

`Detector/GlobalCorrection.lean:15` fixes
`globalPrimeDefectBound P = 240*norm(P)^(-17/10)`.
`CorrectionTail S` at line36 contains only the norm-four and small-tail bounds.
The argument of `exists_uniform_global_cutoff` at line140 is empty: it returns
a prime-norm cutoff nCut, then works for every S containing all primes below
that cutoff. Its local variable called N is **not** the physical slot count.

`Detector/SourceExclusions.lean:24` contains actual primality, bad-prime
inclusion and that CorrectionTail. `exists_source_exclusions` at line29 takes
only a finite initial prime set and its prime/bad-prime proofs. Neither Nslots,
ell, energy epsilonE, first-tail e nor a source window occurs in its type.

The checked `GlobalSourceCorrectionExistenceLowKappa` theorem at line19 selects
one such S before every Hecke character, with analyticity on Re>21/25 and
distance from1 at most1/2 for Re>=21/25. Its proof calls the same global cutoff
through `exists_source_exclusions`. The fixed Euler arguments w=1 and z=1/6
are independent of the source test-function W and total physical slot length.
The companion half-plane theorem at line43 uses that same S for every later
sigma>=21/25. No slot-dependent exclusion is hidden in these statements.

The original complete `SourceData D` requires **more**:
`Detector/FinalAssemblyData.lean:18` stores `FirstTail (4*D.e) S` in addition
to SourceExclusions and maximality. `ParametersFixedSource.exists_fixed_source`
at line26 takes positive e before selecting S, and obtains both exclusion
requirements from `PrimeRows.FirstTail.exists_both_source_exclusions`.
That proof takes max nGlobal nFirst, where nFirst comes from
`exists_first_cutoff eps`. The latter cutoff really depends on its positive
eps through the majorant `240*norm(P)^(-1-min eps (1/50))`.

## The real old constructor order

`ParametersHighData.exists_high_data` first chooses Nslots/ell/rmin at line57.
It then obtains an allowance depending on Nslots, and sets

    small = min allowance (t/(Nslots+2000)).

`exists_detector_scales` is called after these choices. Its true output
includes e<=ellMin/4 and e<=allowance, with ellMin=(7/8)*rmin. Its explicit
body makes e a minimum involving detector epsilon, ellMin and allowance.
Thus e is legitimately chosen after Nslots/ell/rmin; the current type gives
no uniform positive lower bound for e before all possible later slot choices.

`exists_source_data D` at FinalAssemblyData line33 then calls
`exists_fixed_source D.e D.e_pos` and defines the modulus as product(S) at
line38. The actual order is therefore:

    physical Nslots/ell/rmin -> detector e and other source budgets
                            -> FirstTail-compatible S -> ideal M=product(S).

This is more than a cosmetic order in a structure parameter. Actual first-row
consumers, including `Detector/CentralCubeNorm`, require `FirstTail (4*e) S`.
`PrimeRows/FirstTransport.FirstTail.mono_parameter` at line14 only transports
FirstTail eps to a **larger** eps'. It does not let a fixed S chosen for e0
serve a later smaller e. This audit makes no unproved impossibility claim
about every imaginable alternative constructor; it identifies the real
dependencies of the supplied constructor and the missing stronger type.

Keep the three old small parameters separate: D.e is the first-tail/detector
growth parameter; D.eps pays the explicit (Nslots+8)*eps floor budget;
D.epsilon is the detector-witness error. Native energy epsilonE in the new
marked proof is a fourth parameter, chosen from the scalar moment-loss budget.
No existing equality identifies epsilonE with any of those old parameters.
The audited source selection depends directly on4e, not directly on D.eps or
on a newly invented per-slot epsilon_j. If future assembly uses several actual
FirstTail epsilon_j gates, a positive finite minimum can be selected after
those gaps; the existing monotonicity direction then covers larger gaps.

## W is independent and the energy mesh is scalar

`ParametersProbeWindows.exists_probe_window` and
`ParametersFixedSource.exists_fixed_probe_window` have no input parameters.
They construct the real w and its Schwartz complex W on the fixed interval
(1,2), with the actual smoothness, compactness, nonzero and positivity fields.
Although exists_source_data calls this theorem after selecting S, no mathematical
dependence on S, M, Nslots or e is required. Choose this window once at the
start of a new assembly. The slot profile is its complex-valued function,
whereas the w=1 in sourceCorrection is an Euler/Mellin variable.

`Energy/WidthRanges.fineMesh` depends on the real scalar Mcap, Bmask, L,
kappaEnergy and epsilonE. Mcap is a real row-width cap; it is not the ideal
M=product(S). The mesh does not depend on S, ideal M, H, W, Nslots or ell.
Its positivity follows from the recorded scalar nonnegativity and epsilonE>0.
`MarkedHeightBudgetLowKappa.exists_losses_before_height` already constructs
positive losses from dmin/epsilonM before all degrees. The new
LossesBeforeSlot proof retains that scalar block before introducing Slot,
but its present theorem still fixes ideal M/H/W before returning those losses.

## Minimal next genuine interface

For the complete FirstTail route, the clean order is:

1. Fix scalar geometry, target total physical length, scalar moment loss,
   moving-kappa conditions and one actual source window W. Fix any initial
   finite prime set S0 that later exclusions must include.
2. Prove common positive rho/epsilonE from the scalar budget and row-cap margin.
3. Fix energyFineMesh and construct Nslots/ell/slotLower with both physical
   mesh bounds and ell<=energyFineMesh.
4. Choose detector/source e and other small budgets from those actual slots.
5. Select final S using `exists_fixed_source e he S0 hPrimeS0`; it supplies
   SourceExclusions, FirstTail(4e) and maximality. Define M=product(S) and its
   actual nonzero quotient, then H/hH (H=top is an available concrete choice).
6. Call native uniform terminal and actual profile admission with the
   **already selected** epsilonE and Slot=Fin Nslots; choose degree/J/tau
   before every outer character. Degree/J/tau may depend on final S/M/slots.
7. For each outer character, construct actual finite source-label maps,
   radial states, one positive constant and its eventual threshold, then
   quantify every admitted source Batch/fiber/test as in the current field.

A minimal true theorem can expose

    scalar geometry/W -> exists rho epsilonE Nslots ell ...
      -> forall later prime/bad source S with M=product(S), H/hH,
           exists degree J tau -> forall outer eta, exists Ceta -> eventual ...

with explicit epsilonE-based mesh and retained actual source gates. Its proof
must move only the independent scalar loss and physical slot constructor ahead
of the introduction of S/M/H, then invoke the already real native terminal and
admission proofs. The later source-selection callback may require FirstTail,
but the one-field marked bound itself still needs only the real prime/bad/product
dictionary gates. An alternative is to expose a fixed-loss native supply lemma
and assemble the same order directly; its inputs must be genuine scalar budget
proofs, never a supplied whole sum bound or PositiveAt assumption.

This order cannot be obtained by swapping the old existential quantifiers.
The current universal theorem has `forall fixed S/M/H, exists losses/slots`;
it does not state `exists losses/slots, forall later S/M/H`. The implementation
already uses S-independent scalar/slot proofs, so a refactored stronger theorem
is plausible without new analytic estimates, but it is not a checked result
of this read-only audit.

There is no need to transport a prechosen correction function to an unrelated
new S. After the final FirstTail-compatible S is chosen, use the checked
`sourceCorrection_analytic_lowKappa` and `sourceCorrection_bound_lowKappa`
directly with **its** SourceExclusions proof; their types work for every such S.
If an initial correction S0 must be retained, exists_fixed_source can enlarge
that initial prime set, and the generic actual correction lemmas apply afresh
to the final S. Recompute M and source label maps from that final S before
calling the native terminal.

The existing universal marked theorem and the new unmarked admission theorem
remain correctly scoped. They do not themselves establish the complete source
assembly, the inverse two moment fields, an unrestricted RawMomentInput or a
moving count/nonvanishing result. The next priority is this actual scalar/slots
before FirstTail-S interface, then source unmarked states and the inverse fields.
