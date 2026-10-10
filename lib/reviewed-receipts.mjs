// Owner-approved, immutable upstream maintainer receipts; not independent proof certification.
// Never populate this closed registry from live data or cache. Changed content
// requires source inspection and explicit owner review before receiving this label.
export const REVIEWED_RECEIPTS = {
  "9b236d6a5925c2f5768dfd5b200eca93bba76b2dbf23b5aaaefeb1542ebc59da": {
    "record": {
      "status": "Selected maintainer-reviewed conditional witness",
      "kappa": "4609169/10000000000",
      "decimal": "0.0004609169",
      "source_pr": 144,
      "reviewed_head": "c8b22bc5c10dba497ac25804e27d9647d818e2ff",
      "certificate": "certificates/paired-cube-network.json",
      "proof": "notes/paired-cube-note.tex",
      "review": "docs/research/community-round6-review.md",
      "validation": "docs/research/community-round6-validation.json",
      "reproduce": "make paired-cube-verify",
      "scope": "Conditional on retained analytic and fixed-tape interfaces; finite certificates and written review, not a formal proof of multiplication",
      "integration_repairs": [
        "optimized-Python rejection in the bit checker",
        "explicit elementary signed-gate inverse in the proof note"
      ],
      "previous_kappa": "25508460085039/500000000000000000"
    },
    "sourcePR": 144,
    "reviewedHead": "c8b22bc5c10dba497ac25804e27d9647d818e2ff",
    "kappa": "4609169/10000000000",
    "scope": "Conditional on retained analytic and fixed-tape interfaces; finite certificates and written review, not a formal proof of multiplication",
    "reviewHash": "981cdbb5feaa3bdde817584ab6af64c4d168b70d4ef21a2d0dfa58e1b2e1d54c",
    "validationHash": "1e44de3e43edacc91045da504b2e8eb58c4ac46b5cd0e5d152a9224bb1b53d6c",
    "reviewPath": "docs/research/community-round6-review.md",
    "validationPath": "docs/research/community-round6-validation.json",
    "reviewScope": "Codex-assisted maintainer construction audit; no independent human peer review or full multiplication formalization. Some bit reconstruction was inspected in head-pinned CI rather than rerun locally.",
    "readmeHashes": [
      "82a51095522b8e69c7fe6af79a12ae907a1cb5e0ee3428bf2af2a188dd6cc4db"
    ]
  },
  "434456fb153101c31aa69fe5abb67a33f2cfbcb083dbae7ee0f8ff0872d2b20d": {
    "record": {
      "status": "Published on main: maintainer-reviewed conditional construction",
      "kappa": "330942774629799/500000000000000000",
      "decimal": "0.000661885549259598",
      "source_prs": [
        186,
        181,
        168,
        175
      ],
      "parallel_reviewed_prs": [
        182,
        185
      ],
      "source_manifest": "research/coordinated-frames-and-entrance-banks/FILES.json",
      "certificate": "research/coordinated-frames-and-entrance-banks/certificate.json",
      "certificate_sha256": "59b20818af6f850f40d18fd8206b136da504d9cbc57dbbefcba232c62f3384e6",
      "proof": "research/coordinated-frames-and-entrance-banks/PROOF.md",
      "proof_supplements": {
        "research/community-round8-audit/BANK-SCHEDULE.md": "a2ffe4907e3a15004df41a845bbc4d485295f9ca0040fcce08dbbf02ff0f1b1a"
      },
      "review": "docs/research/community-round8-review.md",
      "validation": "docs/research/community-round8-integration.json",
      "reproduce": "make entrance-bank-verify",
      "scope": "Conditional on retained analytic, uniform-recursion and fixed-tape interfaces; finite certificates and written review including the bank scheduling supplement, not a formal proof of multiplication",
      "previous_kappa": "472154791/1000000000000",
      "previous_certificate": "research/recycled-bit-integration/certificate.json",
      "previous_published_kappa": "4609169/10000000000",
      "verification_contributions": [
        101,
        64
      ]
    },
    "schema": "published-composition",
    "sourcePR": 186,
    "reviewedHead": "166a34d75e853e933855f0f7e940fe77c4bb6b8d",
    "kappa": "330942774629799/500000000000000000",
    "scope": "Conditional on retained analytic, uniform-recursion and fixed-tape interfaces; finite certificates and written review including the bank scheduling supplement, not a formal proof of multiplication",
    "reviewHash": "47ba1520e251d501396ca7d316c75848a572036caad111060148a30b00ac4ad0",
    "validationHash": "3cbe7925d0434b131e74b88d04dee8ab7e6d3dd352b5b3bb7b7c461b61cb72c1",
    "reviewPath": "docs/research/community-round8-review.md",
    "validationPath": "docs/research/community-round8-integration.json",
    "artifacts": {
      "research/coordinated-frames-and-entrance-banks/certificate.json": "59b20818af6f850f40d18fd8206b136da504d9cbc57dbbefcba232c62f3384e6",
      "research/coordinated-frames-and-entrance-banks/PROOF.md": "d99304c0062516d86ec0ee5ae7b90b36eacaf400f74cb9d37a9d65aa25e71e31",
      "research/coordinated-frames-and-entrance-banks/FILES.json": "99709b85d987556593f237b0aacf314b2d7982fb4f494378d6dbf03391228ede",
      "research/community-round8-audit/BANK-SCHEDULE.md": "a2ffe4907e3a15004df41a845bbc4d485295f9ca0040fcce08dbbf02ff0f1b1a",
      "research/community-round8-audit/validation.json": "1acc388becac1335745a7dc1f54c5915aa72224d5bad45fb707c5779fa15bcf7"
    },
    "reviewScope": "Codex-assisted maintainer review of a conditional construction, its finite certificates and general bank-scheduling supplement. The integration receipt reports 56 successful Linux jobs. Retained analytic, uniform-recursion and fixed-tape assumptions remain; this is not independent human peer review or a formal proof of multiplication.",
    "readmeHashes": [
      "d104c31d5b7e0d3a8d011a0e3517ab615e5b499b3dc05684f7ad3cadcd28bdae"
    ]
  },
  "df836c6d34509e980d067bd5678489c968bc6e329af9dd82c6207abf6443da89": {
    "record": {
      "status": "Published on main: maintainer-reviewed conditional construction",
      "kappa": "90446448750933/125000000000000000",
      "decimal": "0.000723571590007464",
      "source_prs": [
        279,
        276,
        244,
        234,
        209,
        197,
        237,
        200,
        193,
        168,
        144
      ],
      "source_manifest": "research/five-stage-gen4-banks/MANIFEST.json",
      "certificate": "research/community-pr279-audit/certificate.json",
      "certificate_sha256": "6a457a34b4db57417e5b253cf1c169da2bd6aff4c21363a31fd85dc931d49589",
      "proof": "research/five-stage-gen4-banks/PROOF.md",
      "proof_supplements": {
        "research/five-stage-gen4-banks/BANK-PROOF.md": "bbc328e05848a211c981288514380a4ba12fddaed16c9d23328b5764502be411"
      },
      "review": "docs/research/community-pr279-review.md",
      "validation": "docs/research/community-pr279-integration.json",
      "reproduce": "make gen4-bank-verify",
      "scope": "Conditional on retained all-size compiler, weighted/common-ancestor chart, restored rows, selectors/routing, prime supply, precision/recovery, complex symbolic correctness and analytic transfer; finite replay and written review, not a full formal multiplication theorem.",
      "previous_kappa": "330942774629799/500000000000000000",
      "previous_certificate": "research/coordinated-frames-and-entrance-banks/certificate.json",
      "previous_audited_kappa": "710046193349537/1000000000000000000",
      "audited_source_head": "4d8c31eec7ae618645cb058101cb4e72a97268d3"
    },
    "schema": "published-gen4-composition",
    "sourcePR": 279,
    "reviewedHead": "4d8c31eec7ae618645cb058101cb4e72a97268d3",
    "kappa": "90446448750933/125000000000000000",
    "scope": "Conditional on retained all-size compiler, weighted/common-ancestor chart, restored rows, selectors/routing, prime supply, precision/recovery, complex symbolic correctness and analytic transfer; finite replay and written review, not a full formal multiplication theorem.",
    "reviewHash": "2dffff824e2124baa5c6ece5d0d9c9ea93faeca4a2903a61f706085590f26915",
    "validationHash": "e790e42bbd0e57e3be92191309d3489ec91b738239622e69759604212b2d0f29",
    "reviewPath": "docs/research/community-pr279-review.md",
    "validationPath": "docs/research/community-pr279-integration.json",
    "readmeHashes": [
      "b81f8035b859007add6693c6d860371c9100a6766e494045495a28a457a5fcb9"
    ],
    "artifacts": {
      "research/community-pr279-audit/certificate.json": "6a457a34b4db57417e5b253cf1c169da2bd6aff4c21363a31fd85dc931d49589",
      "research/five-stage-gen4-banks/PROOF.md": "75cd7e51722ebcf826070aca4b289a72526d50264688d8c6bb298bf8a7dfef37",
      "research/five-stage-gen4-banks/BANK-PROOF.md": "bbc328e05848a211c981288514380a4ba12fddaed16c9d23328b5764502be411",
      "research/five-stage-gen4-banks/MANIFEST.json": "99e202d9ffe5baf89e02796edbfc7095b2b227622eccf7b61afa01fd61aeb385",
      "research/community-pr279-audit/verification.json": "d63a463096febb74fc70a19db52ed489e66514413142ffd5d08e3bb6266fde66",
      "research/community-pr279-audit/independent-retiming.json": "9abbc8d2630a4565c59117b73df4fa0f08f93d655a7780e5ccefc29cda701b31",
      "research/community-pr279-audit/independent-word.json": "749d93632987346d62d7d68c5a05f07526eb9f40627bfc1feb4f4cbee15df206",
      "research/community-pr279-audit/pr210-complex-scalar.json": "96eefe380f0ecc884f92b1796573e1f4d81c4dc8b0d400de2268ceb0640ff2d5"
    },
    "reviewScope": "Codex-assisted maintainer review of the pinned conditional construction and finite compatibility audit. The upstream receipt reports nine-stage replay and producer regeneration, independently written retiming and scalar checks, and a reused complex scalar receipt whose source hashes were rechecked; that reused receipt was not freshly executed. This dashboard has not rerun the proof. All-size transfer remains conditional; this is not independent human peer review, a full formal multiplication theorem, or a practical runtime benchmark. Later PR 279 revisions are outside this review."
  }
};
