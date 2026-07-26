# Gottesman Studio Public Simulator Exactness Checklist

Purpose: verify that each public simulator path can take a user-built circuit, apply a matching noise model, select the correct QEC encoding family, run the bounded Render API workflow, and report exact decoder evidence consistently in the UI.

Public constraints for every run:
- No IBM credentials, lab hardware control, private provider secrets, or long paper-run jobs.
- Maximum public shots: 1024.
- Maximum qubits or modes: 12.
- Maximum circuit gates: 96.
- Maximum code distance: 5.
- Maximum QEC rounds: 4.
- Public decoders: MWPM, BP, Union-Find.
- Neural MWPM remains hidden until a real public neural model path is ready.

Live verification summary, July 26 2026:
- PennyLane photonic GKP: pass, `C1D59AFE`, MWPM, LER 4.3945%, PER 1.0986%.
- SchroSIM photonic surface-GKP: pass, `B606CFB9`, MWPM, LER 4.2969%, PER 1.1035%.
- Qiskit Aer superconducting surface: pass, `8E1A71EE`, MWPM, LER 4.2969%, PER 1.1021%.
- Cirq superconducting repetition: pass after QEC-family payload fix, `D2DE011D`, MWPM, LER 4.6875%, PER 1.1021%.
- Frontend build/typecheck: passed.
- Remaining manual repeat check: inspect Scientific Figures during an active selected run and verify figure labels/values match the exact summary counters.

## Common Verification Steps

- [ ] Start local Gottesman Studio frontend against the public API build.
- [ ] Start or confirm the Render public API branch is available.
- [ ] Confirm the dashboard starts at zero: no active run, no fake decoder recommendation, no pre-filled exact counters.
- [ ] Select one simulator only.
- [ ] Open Circuit Design.
- [ ] Confirm architecture choices are constrained correctly for that simulator.
- [ ] Build the circuit manually from the allowed gate set.
- [ ] Add at least one measurement gate.
- [ ] Select a QEC code that matches the architecture.
- [ ] Apply a bounded noise preset or explicit channel levels.
- [ ] Confirm Public Run Envelope stays within public caps.
- [ ] Start the session.
- [ ] Confirm backend session is created and returns a run ID plus session ID.
- [ ] Confirm UI scientific summary uses backend counters, not heuristic diagnostics.
- [ ] Confirm LER tooltip formula is `logical_failures / logical_trials`.
- [ ] Confirm PER tooltip formula is `physical_error_events / physical_error_opportunities`.
- [ ] Confirm decoder ranking only includes MWPM, BP, and Union-Find.
- [ ] Confirm Scientific Figures use the same exact values as Scientific Summary.
- [ ] Confirm QEC Encoding State Map matches selected QEC family.
- [ ] Confirm Live Console logs state that this is public simulator mode and no hardware/private credentials were used.
- [ ] Capture screenshot and record observed result.

## Experiment 1: PennyLane Photonic GKP Circuit

Simulator: PennyLane circuit simulator.

Architecture: Photonic.

QEC code: Digitized GKP.

Circuit design:
- [ ] 3 modes.
- [ ] `DISP(0.45)` on mode 0.
- [ ] `SQ(0.55)` on mode 0.
- [ ] `PHASE(0.35)` on mode 1.
- [ ] `BS(0.50)` control mode 1, target mode 2.
- [ ] `KERR(0.20)` on mode 2.
- [ ] `MEASURE` mode 0.
- [ ] `MEASURE` mode 1.
- [ ] `MEASURE` mode 2.

Noise model:
- [ ] Photon loss enabled.
- [ ] Mode mismatch enabled.
- [ ] Phase drift enabled.
- [ ] Detector dark counts enabled.
- [ ] Non-Gaussian injection failure enabled.
- [ ] Preset: Medium.

Expected exactness:
- [ ] Backend clamps shots to 1024 or less.
- [ ] Backend selects GKP or photonic-compatible encoder state.
- [ ] QEC map shows GKP oscillator map when GKP telemetry exists.
- [ ] Physical-noise figure reports photonic signals when telemetry exists.
- [ ] Decoder ranking excludes Neural MWPM.

Result notes:
- UI run ID: `c1d59afe-9382-4b6d-8887-77a2629562d4` (`C1D59AFE`).
- API session ID: `4a368229-cfa0-4085-92ad-91ac0ac511fc` (`4A368229`).
- Recommended decoder: MWPM.
- LER: 4.3945% from `45 / 1024`.
- PER: 1.0986% from `90 / 8192`.
- Screenshot captured locally during verification.
- Verdict: Pass. UI launched the photonic circuit through the public API, kept the Render envelope within caps, excluded Neural MWPM, logged public-simulator mode, and returned exact counters. Provider validation passes when supplied with the run's request/response counts.

Backend dry-run baseline:
- Recommended decoder: MWPM.
- LER: 4.6117%.
- PER: 1.0986%.
- Shots: 1024.
- Rounds: 4.
- Stabilizers: 3.
- Decoder ranking: MWPM, BP, Union-Find.
- Exact identity check: passed.

## Experiment 2: SchroSIM Photonic Surface-GKP Circuit

Simulator: SchroSIM photonic CV simulator.

Architecture: Photonic.

QEC code: Surface / surface-GKP.

Circuit design:
- [ ] 4 modes.
- [ ] `SQ(0.45)` on mode 0.
- [ ] `SQ(0.45)` on mode 1.
- [ ] `BS(0.50)` control mode 0, target mode 1.
- [ ] `PHASE(0.25)` on mode 2.
- [ ] `CUBIC(0.18)` on mode 2.
- [ ] `BS(0.50)` control mode 2, target mode 3.
- [ ] `MEASURE` mode 0.
- [ ] `MEASURE` mode 1.
- [ ] `MEASURE` mode 2.
- [ ] `MEASURE` mode 3.

Noise model:
- [ ] Photon loss enabled.
- [ ] Mode mismatch enabled.
- [ ] Phase drift enabled.
- [ ] Detector dark counts enabled.
- [ ] Preset: Medium.

Expected exactness:
- [ ] Backend identifies provider as `schrosim`.
- [ ] Architecture remains photonic.
- [ ] Encoder state resolves to surface or surface-compatible public path.
- [ ] Syndrome opportunities equal `rounds * stabilizer_count`.
- [ ] QEC map shows surface syndrome map for this run.
- [ ] Decoder ranking excludes Neural MWPM.

Result notes:
- UI run ID: `b606cfb9-b57d-4b94-851f-191bb1eed5bc` (`B606CFB9`).
- API session ID: `63a4fa93-5733-4221-939e-61391d09ddda` (`63A4FA93`).
- Recommended decoder: MWPM.
- LER: 4.2969% from `44 / 1024`.
- PER: 1.1035% from `113 / 10240`.
- Screenshot captured locally during verification.
- Verdict: Pass. UI launched a four-mode photonic surface-GKP circuit through the SchroSIM public adapter, kept the run bounded, excluded Neural MWPM, validated request/response line coverage, and logged public-simulator/no-hardware mode.

Backend dry-run baseline:
- Recommended decoder: MWPM.
- LER: 4.5006%.
- PER: 1.1035%.
- Shots: 1024.
- Rounds: 4.
- Stabilizers: 4.
- Decoder ranking: MWPM, Union-Find, BP.
- Exact identity check: passed.

## Experiment 3: Qiskit Aer Superconducting Surface Circuit

Simulator: Qiskit Aer noise simulator.

Architecture: Superconducting.

QEC code: Surface.

Circuit design:
- [ ] 3 qubits.
- [ ] `H` on q0.
- [ ] `CX` control q0, target q1.
- [ ] `CZ` control q1, target q2.
- [ ] `RZ(0.30)` on q2.
- [ ] `MEASURE` q0.
- [ ] `MEASURE` q1.
- [ ] `MEASURE` q2.

Noise model:
- [ ] Amplitude damping enabled.
- [ ] Dephasing enabled.
- [ ] Gate depolarizing error enabled.
- [ ] Readout assignment error enabled.
- [ ] Crosstalk / ZZ coupling enabled.
- [ ] Preset: Medium.

Expected exactness:
- [ ] Backend identifies provider as `qiskit`.
- [ ] Architecture remains superconducting.
- [ ] Encoder state resolves to surface.
- [ ] LER and PER are displayed as percentages with exact formulas on hover.
- [ ] QEC map shows surface syndrome map.
- [ ] Decoder ranking excludes Neural MWPM.

Result notes:
- UI run ID: `8e1a71ee-742f-4ff7-a13f-01bea8e65c48` (`8E1A71EE`).
- API session ID: `02f47c7a-094a-4941-9932-80cffcf4263b` (`02F47C7A`).
- Recommended decoder: MWPM.
- LER: 4.2969% from `44 / 1024`.
- PER: 1.1021% from `79 / 7168`.
- Screenshot captured locally during verification.
- Verdict: Pass. UI constrained Qiskit to superconducting/surface-code workflow, compiled to a superconducting native basis, stayed within public caps, excluded Neural MWPM, validated request/response counts, and logged public-simulator/no-hardware mode.

Backend dry-run baseline:
- Recommended decoder: MWPM.
- LER: 4.2557%.
- PER: 1.1021%.
- Shots: 1024.
- Rounds: 4.
- Stabilizers: 4.
- Decoder ranking: MWPM, Union-Find, BP.
- Exact identity check: passed.

## Experiment 4: Cirq Superconducting Repetition Circuit

Simulator: Cirq syndrome simulator.

Architecture: Superconducting.

QEC code: Repetition.

Circuit design:
- [ ] 3 qubits.
- [ ] `X` on q0.
- [ ] `CX` control q0, target q1.
- [ ] `CX` control q1, target q2.
- [ ] `Z` on q1.
- [ ] `MEASURE` q0.
- [ ] `MEASURE` q1.
- [ ] `MEASURE` q2.

Noise model:
- [ ] Dephasing enabled.
- [ ] Gate depolarizing error enabled.
- [ ] Readout assignment error enabled.
- [ ] Preset: Medium.

Expected exactness:
- [ ] Backend identifies provider as `cirq`.
- [ ] Architecture remains superconducting.
- [ ] Encoder state resolves to repetition.
- [ ] QEC subtitle names repetition-code syndrome telemetry.
- [ ] Exact counters remain internally consistent:
  - `response_line_count <= request_line_count` only if backend reports missing lines.
  - `residual_syndrome_rate = residual_syndrome_events / syndrome_opportunities`.
  - `physical_error_rate = physical_error_events / physical_error_opportunities`.
- [ ] Decoder ranking excludes Neural MWPM.

Result notes:
- UI run ID: `d2de011d-42cf-4528-bc79-24b013bbe940` (`D2DE011D`).
- API session ID: `13129f3b-36fd-4cf4-a619-a8d4ea51e45b` (`13129F3B`).
- Recommended decoder: MWPM.
- LER: 4.6875% from `48 / 1024`.
- PER: 1.1021% from `79 / 7168`.
- Screenshot captured locally during verification.
- Verdict: Pass after frontend mapping fix. The first run exposed a mismatch where `circuit_qec_code` was `repetition` but `simulator_code_family` remained `surface`; the launch payload now maps `simulator_code_family` from the selected circuit QEC code. The corrected run shows `repetition` in UI, session config, telemetry encoder state, and logs.

Backend dry-run baseline:
- Recommended decoder: MWPM.
- LER: 4.6922%.
- PER: 1.1021%.
- Shots: 1024.
- Rounds: 4.
- Stabilizers: 4.
- Decoder ranking: MWPM, Union-Find, BP.
- Exact identity check: passed.

## Cross-Experiment Acceptance Criteria

- [ ] All four experiments launch without frontend errors.
- [ ] All four experiments create a backend session.
- [ ] All four experiments return exact scientific counters.
- [ ] Scientific Summary and Scientific Figures agree numerically.
- [ ] QEC map follows the selected architecture/QEC pair.
- [ ] Telemetry, Validation, Logs, Runs, Providers, and Observability pages do not show stale nonzero data before a run begins.
- [ ] Public Run Envelope displays the same caps enforced by the backend.
- [ ] Backend logs clearly state public simulator mode and no hardware/private credentials.
- [ ] No Neural MWPM UI or backend ranking appears in public mode.
- [ ] Results are credible enough for public demo language, but not described as hardware validation.

## Follow-Up Enhancements After These Pass

- [ ] Add downloadable JSON evidence bundles for each run.
- [ ] Add figure export for decoder ranking and QEC map.
- [ ] Add regression tests for API cap enforcement.
- [ ] Add UI tests for zero-state, run-state, and completed-state exactness.
- [ ] Add a public status badge that distinguishes `simulated`, `replayed`, and `hardware-validated`.
