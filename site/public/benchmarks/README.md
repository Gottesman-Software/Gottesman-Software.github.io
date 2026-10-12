# Benchmark register data

The Observatory page is the source for the homepage evidence counts.

Use `data-benchmark-record` on each registered item:

- `stream` for a research stream card
- `literature` for a published reference card
- `hardware-test` for an individual hardware acceptance test

A hardware test contributes to the verified count only when it has both
`data-status="verified"` and a non-empty `data-evidence-href` pointing to its
evidence artifact. Running the site build regenerates `summary.json` and the
homepage summary module from these records.

Run `npm run test:summary` from `site/` after changing this contract.
