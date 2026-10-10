// Locally inspected source statements, not proof approval. Historical versions keep their own values and scope.
export const PROJECT_INTERPRETATIONS = {
  "sidorenko-refinement": {
    "readmeHash": "6d27cab5b9cde46521654f9227b7d167a9a3b48cfa9d9d8e8c50c57b364c6f9a",
    "value": null,
    "display": "1641 → 189",
    "kind": "refinement",
    "scope": "A conditional finite-template and proof-component refinement. The sequential basis-count draft reports internal residual constant 189, so even dimension 190 suffices for one counting stratum; the earlier residue and transverse thresholds of the full construction remain required and may dominate. The 35-vertex minimum applies only within the specified finite template, not all Sidorenko counterexamples. Enumeration completeness and analytic transfer remain dependencies. No smaller general pattern, whole-construction dimension guarantee, independent mathematical review or formal verification is claimed.",
    "previousInterpretations": [
      {
        "readmeHash": "3d99e49231675f67aac26d3df9d57505218a4cfdef2bdc9091e9ca47a83f7e52",
        "value": null,
        "display": "1641 → 978",
        "kind": "refinement",
        "scope": "Conditional on the released source arguments and plantri enumeration completeness. The 35-vertex minimum applies only to the stated finite template, not all Sidorenko counterexamples. The 978 residual constant and sufficient even dimension 980 concern one counting stratum; earlier dimension thresholds may dominate. The alternative 35-vertex certificate has no independently verified analytic transfer. Independent mathematical review and formal verification are not claimed."
      },
      {
        "readmeHash": "cc814a310d4b3bfd334761e673bbdc0c48bac7f907943386ab384a6a7931be7e",
        "value": null,
        "display": "1641 → 1032",
        "kind": "refinement",
        "scope": "Conditional on the released source arguments and plantri enumeration completeness. The 35-vertex minimum applies only to the stated finite template, not all Sidorenko counterexamples. The 1032 residual constant and sufficient even dimension 1034 concern one counting stratum; earlier dimension thresholds may dominate. The alternative 35-vertex certificate has no independently verified analytic transfer. Independent mathematical review and formal verification are not claimed."
      }
    ]
  },
  "unit-grid-refinement": {
    "readmeHash": "ce38d5e65cfbfa49f3cce82fb44546c4a444ec8fe5ae633ef5bafe7e3facc704",
    "value": null,
    "display": "100 → 32 proof-grid edges",
    "kind": "refinement",
    "scope": "Conditional on the original generic-grid, negligible-height and private-valuation lemmas. The new draft uses an 8×4 grid (32 edges) in the general rank-two branch, 6×4 (24 edges) when one locus is a line, and 4×3 (12 edges) only when both loci are the same line. These are proof witnesses, not unit-distance exponents or whole-construction dimensions. No explicit power saving, independent mathematical review, formal verification or literature priority is claimed.",
    "previousInterpretations": [
      {
        "readmeHash": "3ff8fe3de01c75f9145b229a4ee6c5a85137fdc1abc3722b5e2137c3158c7972",
        "value": null,
        "display": "36 edges · 18 on one branch",
        "kind": "refinement",
        "scope": "Conditional on the source generic-grid extraction, negligible-height passage and private-valuation arguments. The general rank-two proof grid has 36 edges instead of 100; an 18-edge grid applies only to the common-line branch. There is no explicit power saving or improved headline unit-distance exponent. Symbolic and finite rational checks do not verify the imported geometric lemmas. Independent mathematical review and formal verification are not claimed."
      },
      {
        "readmeHash": "ba528b9f1edad2dcece105a48752c41afe86b46ab84293a53ba1efa5b030fd7e",
        "value": null,
        "display": "100 → 36 edges",
        "kind": "refinement",
        "scope": "Conditional on the source generic-grid extraction, negligible-height passage and private-valuation arguments. The selected final proof grid has 36 edges instead of 100; no explicit power saving or improved headline unit-distance exponent is supplied. Symbolic and finite rational checks do not verify the imported geometric lemmas. Independent mathematical review and formal verification are not claimed."
      }
    ]
  },
  "matrix-sector-barrier": {
    "readmeHash": "038f83774bcd355f2f72abca9708203d15d17f94305c053f57a610e6debe402d",
    "value": null,
    "display": "Sector-method barrier",
    "kind": "method-limit",
    "scope": "An abstract obstruction for the listed scalar and symmetrized matched-sector inequalities, now with a least admissible profile and sharp diagonal constant within those constraints. The profile need not be a realizable tensor character. This is not a new multiplication algorithm, a lower bound on the actual exponent or proof that 9/4 is optimal. Finite rational checks supplement the written all-parameter argument. Independent mathematical review and formal verification are not claimed.",
    "previousInterpretations": [
      {
        "readmeHash": "0725fe5dee5bbef275f531902dea5c40e5c4b6224986b5be56b76020547da816",
        "value": null,
        "display": "Sector-method barrier",
        "kind": "method-limit",
        "scope": "An obstruction for the listed scalar and symmetrized standard matched-sector inequalities, with no auxiliary output factors. The abstract profile is not claimed to be a realizable tensor character. This is not a new multiplication algorithm, a lower bound on the actual exponent, or a proof that 9/4 is optimal. Other blocks, factors and tensor constraints remain open. Independent mathematical review and formal verification are not claimed."
      },
      {
        "readmeHash": "14139d348d497b1244423090ec2c71916889817a83692bab40ebf844b8f5bb72",
        "value": null,
        "display": "Sector-method barrier",
        "kind": "method-limit",
        "scope": "An obstruction for the listed scalar and symmetrized standard matched-sector inequalities, with no auxiliary output factors. The abstract profile is not claimed to be a realizable tensor character. This is not a new multiplication algorithm, a lower bound on the actual exponent, or a proof that 9/4 is optimal. Other blocks, factors and tensor constraints remain open. Independent mathematical review and formal verification are not claimed."
      }
    ]
  },
  "fourier-eumemic": {
    "readmeHash": "eb030a25060f0b93abd7b8e301650ef70e428045fc0cfe1afd1ed52fda297acb",
    "value": 0.0004856,
    "display": "δ < 0.0004856",
    "kind": "conditional",
    "scope": "The stated bound includes a log-log factor. Every smaller fixed saving can absorb that factor; the endpoint itself is not a pure-power guarantee."
  },
  "fourier-shea": {
    "readmeHash": "08b2caa75c73911b65f62070a08faedbb31cf50be809a25f04c5f6addfd3594f",
    "value": 0.000754736,
    "display": "7.54736 × 10⁻⁴",
    "kind": "proposed",
    "scope": "The source reports incorporation and a Lean replay of an all-positive-length exact DFT theorem with δ = 0.000754736, strictly below tensor saving 0.0007547361. Exact complex arithmetic, supplied roots, scalar preparation and bounded indexing remain part of the model. This app has inspected the pinned report and receipt but has not independently replayed Lean, the official comparator or a second kernel. Independent human review remains pending; the earlier written exposition has not thereby all been formalized.",
    "previousInterpretations": [
      {
        "readmeHash": "ff0a8303d4af9ff0db0bbb80341920012e44edfa2a6e8017c1c377332b5756c4",
        "value": 0.00067,
        "display": "6.7 × 10⁻⁴",
        "kind": "proposed",
        "scope": "Proposed conditional all-length Fourier transfer in the exact-complex-arithmetic and logarithmic-word array model. The chosen saving is strictly below its tensor witness. Scalar checks and same-assistant review do not prove the full frame, cover, uniform array-layout, recursion or all-length transfer. Independent mathematical review and end-to-end formal verification remain outstanding; no practical FFT speedup is claimed."
      },
      {
        "readmeHash": "1290b7c864a175646646ec6e2c75a3c0d2c29cb1019b0b703b1935738cc54c89",
        "value": 0.00007299999999999999,
        "display": "≈ 7.3 × 10⁻⁵",
        "kind": "proposed",
        "scope": "Written argument and exact finite checks. Independent mathematical review and end-to-end formal verification remain outstanding."
      }
    ]
  },
  "fourier-lean": {
    "readmeHash": "0778380c0d69faf0b2263edc4c646ade3ecd6ac8fc3431c3def8389868f98c1e",
    "value": 0.0000032,
    "display": "3.2 × 10⁻⁶",
    "kind": "proposed",
    "scope": "The repository reports an end-to-end Lean theorem in OpenAI’s exact-arithmetic model, with standard axioms only. This app has not independently compiled the proof or checked statement equivalence."
  },
  "matrix-fields": {
    "readmeHash": "25ef57746dd00bc0d6383d9a5918867c6a24bb2b1423701627bde7f86dd37a07",
    "value": 2.25,
    "display": "2.25 · every field",
    "kind": "extension",
    "scope": "Same exponent, broader class of fields. Repository-reported Lean checking; this app does not independently compile the proof or claim a practical speedup."
  },
  "zero-crossnox": {
    "readmeHash": "01fa9167d59b31b795d8a76129b321b71d3cc3de3823c31a9056dcf10c55e76c",
    "value": 0.8749570698,
    "display": "0.8749570698",
    "kind": "extension",
    "scope": "An extension of the upstream seven-eighths argument. Its soundness depends on that proof; the app has not independently rerun Lean or Comparator."
  },
  "zero-cubic": {
    "readmeHash": "cee78c28abb41a35dd3d86eff924f00e0152f03798a65d5f424064d122111ec9",
    "value": 0.874957019420099,
    "display": "≈ 0.8749570194",
    "kind": "conditional",
    "scope": "The repository reports formalizations of the numerical boundary and selected reductions, including a strengthened source-after-slots interface. The complete moment record, remaining source budgets and physical probe remain open; the strongest zeta theorem has an explicit arithmetic-probe hypothesis. An unconditional improved-region proof is pending.",
    "previousInterpretations": [
      {
        "readmeHash": "d42532be2aa568eecdcf92f7604d66c337a4c87fe105be70a8555d7f207132ee",
        "previousReadmeHashes": [
          "5f2aaedaebd7527d93dbc4c7c2ec02a650ade41d1e6b558469ae7184d3d32e9e"
        ],
        "value": 0.874957019420099,
        "display": "≈ 0.8749570194",
        "kind": "conditional",
        "scope": "The repository reports formalizations of the numerical boundary and selected reductions. The full physical probe and estimates remain open; the strongest zeta theorem has an explicit arithmetic-probe hypothesis. An unconditional improved-region proof is pending."
      }
    ]
  },
  "triangles": {
    "readmeHash": "52a45ae3797b89d57c3dc8b6fc9b016246fedc8fa787c74c20f5ddd99457bec9",
    "value": 2.923506661672024e-47,
    "display": "≈ 2.92351 × 10⁻⁴⁷",
    "kind": "conditional",
    "scope": "Conditional on the pinned manuscript’s geometric estimates. The repository reports formalized finite packing and scale components; the full geometry and Heilbronn theorem are not."
  },
  "integer-lean": {
    "readmeHash": "b0b48be0b96db9314def6dd7aa81fdef6092847ae2a64b64d8c29ff35d96ffaf",
    "value": null,
    "display": "End-to-end proof open",
    "kind": "verification",
    "scope": "The end-to-end multiplication theorem is not proved. The source reports a complete ordinary quadratic-time machine and additional physical stopped-call, child-return and controller components; the final sub-n-log-n fast path remains open. Its target kappa is not an achieved saving. Reported component proofs have not been independently compiled by this dashboard.",
    "previousInterpretations": [
      {
        "readmeHash": "c112e45c007eba4928550999111d2949f70e8f74a117e99461ccc6bff4c585e4",
        "value": null,
        "display": "End-to-end proof open",
        "kind": "verification",
        "scope": "The end-to-end multiplication theorem is explicitly not proved. The repository reports all-width selected-stage execution, paid inverses, descriptor replacement and binary-basis XOR compilation. Actual phase-frame bases and the identification of physical selected-address coordinates, individual small-dimension kernels and recursive network assembly remain open. A target bound is not an achieved bound."
      },
      {
        "readmeHash": "74fa3a9b3b1e8c0535147b0e4ee91ed2402415253ec4345cf15e1dd5c771ff0e",
        "value": null,
        "display": "End-to-end proof open",
        "kind": "verification",
        "scope": "The end-to-end multiplication theorem is explicitly not proved. The repository reports all-width selected-stage execution, paid inverses, descriptor replacement and binary-basis XOR compilation. Phase-frame and address wiring for repeated execution, individual small-dimension kernels and recursive network assembly remain open. A target bound is not an achieved bound."
      },
      {
        "readmeHash": "38e1192e2609f46151073c8501b9615401139732630f24bf210304198acd5e51",
        "value": null,
        "display": "End-to-end proof open",
        "kind": "verification",
        "scope": "The end-to-end multiplication theorem is explicitly not proved. Repository-reported bit-machine components do not complete direction dispatch, producer wiring, fallback kernels, repeated butterfly execution or recursive network assembly. A target bound is not an achieved bound."
      },
      {
        "readmeHash": "a2543734eea4d1e737102130c9a5a2ce63cf37b43a2484e5f12f9bb17269110f",
        "previousReadmeHashes": [
          "e44fb130bb7abd53cddd7bd7939ef9ad2904b776ed4a730accb8c46b0cf81820"
        ],
        "value": null,
        "display": "End-to-end proof open",
        "kind": "verification",
        "scope": "The end-to-end multiplication theorem is explicitly not proved. A target bound is not an achieved bound."
      }
    ]
  },
  "integer-extension": {
    "readmeHash": "4c24dd5aa0897a77786c61568f8933c196073b6d3fddd9f17f5da6b14657fe82",
    "value": 0.000036942,
    "display": "3.6942 × 10⁻⁵",
    "kind": "conditional",
    "scope": "Finite checks support conditional arguments. Global interfaces remain inherited assumptions; the latest experimental candidate need not replace the main certificate."
  },
  "scheduling": {
    "readmeHash": "c74770de73486a5aaa46c361936c7db9b1efcab9ef62652f3a9a1d88e17de164",
    "value": null,
    "display": "4-machine exploration",
    "kind": "exploration",
    "scope": "The author describes this as educational work and requests review of assumptions. Four machines are a research target here, not an accepted frontier update."
  },
  "van-der-waerden": {
    "readmeHash": "cd41154d35978d0d9f5a428750547f0919870e72e35086eb44d5680d825cde14",
    "value": 0.04,
    "display": "1/25",
    "kind": "conditional",
    "scope": "Conditional on the upstream geometric and counting lemmas and a modified local-lemma transfer. The new draft proposes c = 1/25 with a sufficiently-large-k threshold independent of the colour count r. Shorter dilation, sharper bit balance and separate balancing of light positions outside heavy blocks are written dependencies that have not been independently reviewed. Exact rational margins do not prove the full transfer. The retained sharpened region admits every fixed c < 1/24; that endpoint is not asserted. No finite colouring record, runtime speedup or literature priority is established.",
    "previousInterpretations": [
      {
        "readmeHash": "653abc287f8ad57d0e10d99df22fbc3f59c262c7158d0ce74039ec81d46b8e4f",
        "value": 0.0051813471502590676,
        "display": "1/193",
        "kind": "conditional",
        "scope": "Conditional on the upstream geometric and counting arguments, including uniform constants and all imported hypotheses. Exact parameter checks do not establish the complete transfer theorem. Independent mathematical review and formal verification are outstanding; literature priority is not established. A larger coefficient is not a finite colouring record or a runtime speedup. The companion matrix-profile obstruction is not a new matrix-multiplication algorithm or exponent. The source also states c < 1/192 within its retained estimates; that endpoint is not asserted."
      },
      {
        "readmeHash": "00bc977ab45480c2e8f54a997fe12aa0f351f588b43c1d9a1b113cb8aac3c2cc",
        "previousReadmeHashes": [
          "8ae3917ed80b2b40df3969c9231c7629c5151578abac855dcc6a38ddde52c74d"
        ],
        "value": 0.005,
        "display": "1/200",
        "kind": "conditional",
        "scope": "Conditional on the upstream geometric and counting arguments, including uniform constants and all imported hypotheses. Exact parameter checks do not establish the complete transfer theorem. Independent mathematical review and formal verification are outstanding; literature priority is not established. A larger coefficient is not a finite colouring record or a runtime speedup. The companion matrix-profile obstruction is not a new matrix-multiplication algorithm or exponent. The source also states c < 1/192 within its retained estimates; that endpoint is not asserted."
      }
    ]
  },
  "matroid-shea": {
    "readmeHash": "0486831e71b151036075acb70ec0a7b63aa030e1ef144b49a8abacaad453ac81",
    "value": 5.820766091346741e-11,
    "display": "> 2⁻³⁴",
    "kind": "proposed",
    "scope": "A written one-sample matroid prophet proof proposing a coefficient above 2⁻³⁴, with one independent sample per element and 37n+24 initial fair bits. It retains arbitrary finite matroids, independent nonnegative values, integrable offline optimum, exact observations and an arrival adversary that sees the complete seed. Computation and storage may be exponential. Same-agent audits and finite arithmetic do not prove the universal theorem; independent mathematical review and formalization are pending. The displayed release baseline is the 2⁻³¹⁰ one-sample guarantee, not the separate 2⁻²⁹³ hidden-vector result."
  }
};
export function interpretationFor(known, sourceHash) {
  if (!known) return null;
  if (known.readmeHash === sourceHash || known.previousReadmeHashes?.includes(sourceHash)) return known;
  return known.previousInterpretations?.find(v => v.readmeHash === sourceHash || v.previousReadmeHashes?.includes(sourceHash)) ?? null;
}
export const matchesInterpretation = (known, sourceHash) => !!interpretationFor(known, sourceHash);
