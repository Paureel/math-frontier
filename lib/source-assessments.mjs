// Locally inspected repository-specific evidence. Never derive approval from live data.
export const SOURCE_ASSESSMENTS = {
  "crocswap": {
    "commit": "12a4934d15006e8c10f9b2264f13f8f341be802b",
    "readmeHash": "b81f8035b859007add6693c6d860371c9100a6766e494045495a28a457a5fcb9",
    "previousReadmeHashes": [
      "82a51095522b8e69c7fe6af79a12ae907a1cb5e0ee3428bf2af2a188dd6cc4db",
      "d104c31d5b7e0d3a8d011a0e3517ab615e5b499b3dc05684f7ad3cadcd28bdae"
    ],
    "label": "Maintainer-reviewed conditional construction",
    "summary": "The selected gen4 construction combines the PR 276 circuit with PR 279 common-delivery retiming at the audited head. The upstream maintainer reviewed the finite replay, producer regeneration and written compatibility argument.",
    "limitations": "Conditional on retained all-size compiler, weighted/common-ancestor chart, restored rows, selectors/routing, prime supply, precision/recovery, complex symbolic correctness and analytic transfer; finite replay and written review, not a full formal multiplication theorem. The Codex-assisted maintainer review is not independent human peer review. This dashboard has not rerun the proof; the inherited complex scalar receipt was reused after hash checks, not freshly executed. Later PR 279 revisions remain unreviewed.",
    "sources": [
      {
        "path": "certificates/selected-result.json",
        "sha256": "df836c6d34509e980d067bd5678489c968bc6e329af9dd82c6207abf6443da89"
      },
      {
        "path": "docs/research/community-pr279-review.md",
        "sha256": "2dffff824e2124baa5c6ece5d0d9c9ea93faeca4a2903a61f706085590f26915"
      },
      {
        "path": "docs/research/community-pr279-integration.json",
        "sha256": "e790e42bbd0e57e3be92191309d3489ec91b738239622e69759604212b2d0f29"
      },
      {
        "path": "research/community-pr279-audit/certificate.json",
        "sha256": "6a457a34b4db57417e5b253cf1c169da2bd6aff4c21363a31fd85dc931d49589"
      },
      {
        "path": "research/five-stage-gen4-banks/PROOF.md",
        "sha256": "75cd7e51722ebcf826070aca4b289a72526d50264688d8c6bb298bf8a7dfef37"
      },
      {
        "path": "research/five-stage-gen4-banks/BANK-PROOF.md",
        "sha256": "bbc328e05848a211c981288514380a4ba12fddaed16c9d23328b5764502be411"
      },
      {
        "path": "research/five-stage-gen4-banks/MANIFEST.json",
        "sha256": "99e202d9ffe5baf89e02796edbfc7095b2b227622eccf7b61afa01fd61aeb385"
      },
      {
        "path": "research/community-pr279-audit/verification.json",
        "sha256": "d63a463096febb74fc70a19db52ed489e66514413142ffd5d08e3bb6266fde66"
      },
      {
        "path": "research/community-pr279-audit/independent-retiming.json",
        "sha256": "9abbc8d2630a4565c59117b73df4fa0f08f93d655a7780e5ccefc29cda701b31"
      },
      {
        "path": "research/community-pr279-audit/independent-word.json",
        "sha256": "749d93632987346d62d7d68c5a05f07526eb9f40627bfc1feb4f4cbee15df206"
      },
      {
        "path": "research/community-pr279-audit/pr210-complex-scalar.json",
        "sha256": "96eefe380f0ecc884f92b1796573e1f4d81c4dc8b0d400de2268ceb0640ff2d5"
      }
    ]
  },
  "fourier-eumemic": {
    "commit": "6f87d1a0c9ae462cdcb2034a1361c87623221e66",
    "readmeHash": "eb030a25060f0b93abd7b8e301650ef70e428045fc0cfe1afd1ed52fda297acb",
    "label": "Exact finite moment certificate",
    "summary": "A written Fourier construction is supported by an exact rational moment certificate and a source inventory.",
    "limitations": "The reported endpoint includes a log-log factor; only strictly smaller fixed savings give a pure power bound. Finite arithmetic does not verify the complete algorithm or transfer argument.",
    "sources": [
      {
        "path": "SOURCES.json",
        "sha256": "7b50c7016efb294765207c54f9f539e129a13d1804e3a19546f9f7ee63669bec"
      },
      {
        "path": "certificates/moment.json",
        "sha256": "57348140ad4d6a7283bd9ed41e9d46c6c2ad9cc86bdfd1c0968fd8ce960e5fb5"
      }
    ]
  },
  "fourier-shea": {
    "commit": "62554f945b58454fb8452f4daaca1222ce5ca58e",
    "readmeHash": "08b2caa75c73911b65f62070a08faedbb31cf50be809a25f04c5f6addfd3594f",
    "label": "Repository-reported all-length Lean replay",
    "summary": "The current selected five-stage source pair reports Fourier saving δ = 0.000754736, with a finite certificate and a recorded Lean build and statement comparison.",
    "limitations": "The dashboard has not independently rerun the proof or validated every imported dependency. The source reports no official comparator or second-kernel run and no independent human review. Larger queue targets and integer κ values do not replace this Fourier δ.",
    "sources": [
      {
        "path": "results/registry.json",
        "sha256": "78f15065fd58fb40674204b1fc2fdb73414825a02e9fda7bc925881285483abc"
      },
      {
        "path": "results/five-stage-pr233.md",
        "sha256": "2e4ecb2da7a276860dc11a3dcae4273999384f8a0b1e5cd3c2115fe8a3bd1b6a"
      },
      {
        "path": "verification/FIVE_STAGE_AUDIT.md",
        "sha256": "9c7c411cdf71fefae22ec14e2b10b8df874f6fa282737f13dc5dbff44e28d382"
      },
      {
        "path": "verification/certificates/five_stage_reference.json",
        "sha256": "295a3f5c0e6843db7fec76b25609d93e0a7aeb60fb79c394e1851ebb6a8789f1"
      },
      {
        "path": "verification/certificates/five_stage_lean_receipt.json",
        "sha256": "195df11c9eb43f56a671bd5f90c96f810bac8ea954cde85dc44c100e04190604"
      },
      {
        "path": "paper/framework.md",
        "sha256": "1c9fd478acf2c4e56b70e8077c453000c425b20fbe909ae169a45a290f011e63"
      }
    ]
  },
  "fourier-lean": {
    "commit": "1a7b25e3a934459eb2c1bf69f4b85627fbef9cd3",
    "readmeHash": "0778380c0d69faf0b2263edc4c646ade3ecd6ac8fc3431c3def8389868f98c1e",
    "label": "Repository-reported end-to-end Lean proof",
    "summary": "The verification report identifies an end-to-end theorem in the exact-arithmetic RAM model, an axiom audit and Lean kernel replays.",
    "limitations": "This app has inspected the statement and verification report, but has not independently compiled Lean or checked every dependency or statement equivalence. The numerical claim remains unreviewed here.",
    "sources": [
      {
        "path": "VERIFICATION.md",
        "sha256": "f249ce867b751f4ceb17a474d4c411ab540879305bb5ff2fcbad88d3ecd06b74"
      },
      {
        "path": "lean/Check.lean",
        "sha256": "f660d3be862328f3c9f903ec68187fbc3147a4db0b721cca87ea32bc1163df5d"
      }
    ]
  },
  "matrix-fields": {
    "commit": "08481ef22bca7dc9ffba091083b7c1e81e537220",
    "readmeHash": "25ef57746dd00bc0d6383d9a5918867c6a24bb2b1423701627bde7f86dd37a07",
    "label": "Repository-reported Lean field extension",
    "summary": "The verification report describes Lean and Comparator checks for extending the 9/4 exponent to every field.",
    "limitations": "This is broader field coverage at the same exponent. Checks reported by the repository are not an independently replayed proof in this app or a practical speed benchmark.",
    "sources": [
      {
        "path": "docs/field-port/VERIFICATION.md",
        "sha256": "bb366782e78114d7ea12810fe575a6b4da9e3ed1deb64ae20add2233ccd6067a"
      }
    ]
  },
  "zero-crossnox": {
    "commit": "f677cc0a820bb2aff86bb4cbe783d076f5c097db",
    "readmeHash": "01fa9167d59b31b795d8a76129b321b71d3cc3de3823c31a9056dcf10c55e76c",
    "label": "Repository-reported Lean zero-free extension",
    "summary": "The formalization report states Hecke, Dirichlet and zeta extensions using the upstream seven-eighths theorem, with Lean and Comparator checks.",
    "limitations": "The extension depends on the upstream theorem and its model. This app has not independently rerun Lean or Comparator.",
    "sources": [
      {
        "path": "docs/FORMALIZATION.md",
        "sha256": "3abcc91a57f2d015556426c84dbade59efe460ccbadb7dea62719f11121ae842"
      }
    ]
  },
  "zero-cubic": {
    "commit": "ebf33a7da37784960c8bf758d4f901a9e16c1322",
    "readmeHash": "cee78c28abb41a35dd3d86eff924f00e0152f03798a65d5f424064d122111ec9",
    "label": "Formal components; analytic obligation open",
    "summary": "The updated proof-status and integrity reports describe 99 selected roots across 34 modules, including a strengthened source-after-slots interface. These are repository-reported replays; the numerical boundary is unchanged.",
    "limitations": "The earlier source-order gate is reported cleared, but complete source budgets, the four-field moment record and the physical probe remain open. Reported kernel checks do not remove the explicit theorem hypothesis or establish an unconditional improved region; this app has not independently compiled Lean.",
    "sources": [
      {
        "path": "docs/proof-status.md",
        "sha256": "03b69f62d70f9da84b861478ef434925afc39be4f35dff052ad77952c3a690f9"
      },
      {
        "path": "verification/independent-kernel.json",
        "sha256": "14337695daf10f31304d212fd97e0fa48c4bbe3092911ecdf05beb3fbbb430d9"
      },
      {
        "path": "docs/source-assembly-order-audit/README.md",
        "sha256": "9bc399db0bfece682fce454c894a0ca05d69902b8c75b7a6530354f175829deb"
      },
      {
        "path": "upstream/plain-kappa/README.md",
        "sha256": "60fc4d83ac9588bfafe49eb3c98e04c6709c6f4bc90441d07663eebec2c1177c"
      },
      {
        "path": "upstream/plain-kappa/verification/authored99-independent-evidence-integrity.json",
        "sha256": "b04cc85b5f16cdf285acd296416ab32c371468639a73f11e97deb1fd98b7d97b"
      }
    ]
  },
  "triangles": {
    "commit": "2259fc0f9d7edc0785838bceee835829df034952",
    "readmeHash": "52a45ae3797b89d57c3dc8b6fc9b016246fedc8fa787c74c20f5ddd99457bec9",
    "label": "Reviewed finite components",
    "summary": "The project review and central certificate support finite packing and scale components of a conditional triangle-bound argument.",
    "limitations": "The full geometric estimates and all-size Heilbronn theorem are not formalized. The finite certificate does not establish those imported estimates.",
    "sources": [
      {
        "path": "docs/review.md",
        "sha256": "b2b31620a793704f4b391959097257e03889077e41eec8393627ca1253ab6e38"
      },
      {
        "path": "certificates/central.json",
        "sha256": "41f9889d0b318bcf51e1bc49c87fb76d0fffced60d0aa04ffca13538c5d26cf9"
      }
    ]
  },
  "integer-lean": {
    "commit": "c53cc0124e652cbe2bffb13946839cbe5aecc3a6",
    "readmeHash": "b0b48be0b96db9314def6dd7aa81fdef6092847ae2a64b64d8c29ff35d96ffaf",
    "label": "Formalization in progress",
    "summary": "The source reports a complete ordinary quadratic-time multiplier and substantial tape-machine components, while explicitly leaving the fast end-to-end multiplication theorem unproved.",
    "limitations": "Inherited precision propagation, interleaved unstopped recursive execution, root callback discharge and the uniform physical recursive cost sum remain open. The Schönhage–Strassen recursion, its cost and tape machines also remain work in progress. A quadratic-time correct machine does not establish the target sub-n-log-n bound.",
    "sources": [
      {
        "path": "AxiomAudit.lean",
        "sha256": "76c71c3dcebb90a15762e13bba20d80a27241649e497a2b17aeb13fcd34c1743"
      },
      {
        "path": "IntegerMultBounds/Machine.lean",
        "sha256": "130a6994ab700bab0f4aecce3b8ce95e1d77e2f6f88e0f216cebe5ecbb04bed6"
      }
    ]
  },
  "integer-extension": {
    "commit": "2298fe65a8a4d10e18b39edc7e9a5e2d5d50f7b9",
    "readmeHash": "4c24dd5aa0897a77786c61568f8933c196073b6d3fddd9f17f5da6b14657fe82",
    "label": "Unreviewed conditional certificate",
    "summary": "The main README and latest certificate describe a conditional multiplication saving with finite precision and interface checks.",
    "limitations": "Inherited global interfaces remain assumptions. An experimental candidate or a PASS field cannot replace an inspected main claim or establish the full theorem.",
    "sources": [
      {
        "path": "certificates/latest.json",
        "sha256": "339b4ccb81edd7a4099bda986d251786300fee76d91f4970ec52ac6c4e525128"
      }
    ]
  },
  "scheduling": {
    "commit": "6faeb33e9bf29c6e769fdd9fd49aa0567078ea5c",
    "readmeHash": "c74770de73486a5aaa46c361936c7db9b1efcab9ef62652f3a9a1d88e17de164",
    "label": "Educational exploration",
    "summary": "The README describes a four-machine research target and requests review of its assumptions.",
    "limitations": "No accepted four-machine bound or validated frontier improvement is reported. A target is not an achieved result.",
    "sources": []
  },
  "van-der-waerden": {
    "commit": "54ac9715fceab938ca77d5980c36ab691765a04d",
    "readmeHash": "cd41154d35978d0d9f5a428750547f0919870e72e35086eb44d5680d825cde14",
    "label": "Exact conditional parameter audit",
    "summary": "The sharpened-region proof note and exact parameter audit support the displayed conditional coefficient c = 1/25; the proposed sufficient range is strictly c < 1/24.",
    "limitations": "The three changes to the local-lemma transfer still require independent mathematical review, alongside imported geometric and counting hypotheses. The endpoint is not attained and no finite threshold or colouring record is supplied.",
    "sources": [
      {
        "path": "experiments/exact-audit.json",
        "sha256": "917ac588397e9ca1098c8fbccc18d01f16f2ca4ffab6a7a68dfbfdb7b9f9b075"
      },
      {
        "path": "research-note.tex",
        "sha256": "700a23a04b9ac5845fd961366c02fcf781c57334bd1af28a99b41130d28172c2"
      },
      {
        "path": "parameters.json",
        "sha256": "5d7cc3391820ed4d9ef7b608d0ab574197f2f35b5069b5eba68b645d97f449a2"
      },
      {
        "path": "sharpened-region-proof.md",
        "sha256": "daf7302d0a5c1efc0334c6c908a57356863ccf8b18bd1ffcf92b1ac55c321640"
      }
    ]
  },
  "sidorenko-refinement": {
    "commit": "d1df2a5cc0cb0c9003466b1c7f8ecb77a8e72a7d",
    "readmeHash": "6d27cab5b9cde46521654f9227b7d167a9a3b48cfa9d9d8e8c50c57b364c6f9a",
    "label": "Finite template and counting refinement",
    "summary": "The sequential basis-count note and saved arithmetic audit report residual constant 189, improving 978 and the original 1641. The 35-vertex template minimum retains its limited scope.",
    "limitations": "Even dimension 190 is sufficient for one counting stratum only; earlier full-construction thresholds may dominate. Finite enumeration is not a global minimum or an independently verified analytic counterexample.",
    "sources": [
      {
        "path": "experiments/residual-expected.json",
        "sha256": "ae991deec136e2bb92dffac2ebdbf6e95e4f50675dcb13d9ad8e25e84af9f832"
      },
      {
        "path": "experiments/minimality-independent.json",
        "sha256": "72cd1a89f06b1f231c081dcf5cb62448654fb75e3f062f35e83d284e1e178613"
      },
      {
        "path": "support-refinement.md",
        "sha256": "aac209ab465af19c4acf8a659c7a922103af126f0505d577f365ec976ab6e33f"
      },
      {
        "path": "experiments/support-expected.json",
        "sha256": "6dc351a495dda04c14c1b6a666980892da5cec29abd270f994bba7f1230338ec"
      },
      {
        "path": "sequential-refinement.md",
        "sha256": "4fda960d3b355ce969e8279238746618e09e238fb9f4ec7160d35065bf165b92"
      },
      {
        "path": "experiments/sequential-expected.json",
        "sha256": "a53800e9bdfadb6895f2f0f0f66e64218d4a8a8f0a4257d58c1cc2bfbedf0d21"
      }
    ]
  },
  "unit-grid-refinement": {
    "commit": "62455a6709204f79a3a93c4eace817c3ce0d54ec",
    "readmeHash": "ce38d5e65cfbfa49f3cce82fb44546c4a444ec8fe5ae633ef5bafe7e3facc704",
    "label": "Written proof-component refinement",
    "summary": "The revised proof adds a velocity scaling and reports proof grids with 32 general edges, 24 when one locus is a line, and 12 only in the common-line branch.",
    "limitations": "The smaller grids retain imported generic-grid and private-valuation lemmas. Algebraic checks do not establish those lemmas, a new unit-distance exponent or an explicit saving.",
    "sources": [
      {
        "path": "proof.tex",
        "sha256": "89c7ae6754c07a7c71e0eca7b6446f13b27d84ce3adc7ef9aa4eb204e4dc50a0"
      }
    ]
  },
  "matrix-sector-barrier": {
    "commit": "f9c93d8d50ff7c6ddaa5c43aaeecd03bb5835a1a",
    "readmeHash": "038f83774bcd355f2f72abca9708203d15d17f94305c053f57a610e6debe402d",
    "label": "Written limitation of a method",
    "summary": "The revised note identifies a least admissible abstract profile and a sharp diagonal constant within the retained constraint system; the existing sector-method barrier is unchanged.",
    "limitations": "Abstract admissibility does not establish tensor realizability, a better multiplication algorithm or a lower bound on the actual exponent. No new headline exponent is supplied.",
    "sources": [
      {
        "path": "proof.tex",
        "sha256": "cc6b918836a6a91d4199e5bb03ad12462f037f3f3b71352efc88ea7d7b535d42"
      }
    ]
  },
  "matroid-shea": {
    "commit": "08300e2d9c4a8529db0198631716b7ef20dd8aa5",
    "readmeHash": "0486831e71b151036075acb70ec0a7b63aa030e1ef144b49a8abacaad453ac81",
    "label": "Written proof; independent review pending",
    "summary": "The current joint-residual draft supersedes the announced 2⁻³⁶ version with a proposed coefficient above 2⁻³⁴ and a recorded exact scalar certificate.",
    "limitations": "The proof uses the original structural lemmas, a shared-variable encoding and density cutoff. Same-agent second passes and finite tests are not independent mathematical review or a formal theorem. This dashboard has not executed upstream code or formalized the result.",
    "sources": [
      {
        "path": "manuscript.md",
        "sha256": "11774c0c5a0aebf5061c44e91539cecd90c8882fb97a43d9b831d6c826de8de1"
      },
      {
        "path": "results/current.json",
        "sha256": "bdc8cb5e8c4be8dae8ce12709fb6213983cdac3665bc4b85426d95216a019f0c"
      },
      {
        "path": "verification/README.md",
        "sha256": "e985a030faaacdfc210e57c997a6f3ebe5581ce14e326058f46a532d15848de5"
      },
      {
        "path": "proofs/joint_residual.md",
        "sha256": "4a5223586ad79b28ddc5342206ad5f70d92c1e50b1a8c13b4d3c6e8b14ffb7f1"
      },
      {
        "path": "proofs/joint_residual_audit.md",
        "sha256": "8394ac1e3623db57209d4b3316d307fca824739073b99b532ce58b33a6d25adc"
      },
      {
        "path": "verification/reference/joint_residual_constants_output.json",
        "sha256": "a874a68a51249652ccfd3272f6e9c3c42b4bacfcc3aa1acdfbf4d38d5bc2c40a"
      }
    ]
  }
};
