import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";

import { useProviders, useRunTelemetry, useRuns } from "../../api/hooks";
import type { ProviderKind, Run, RunTelemetry } from "../../api/types";
import { useDataMode } from "../../data/dataMode";
import { useSessionControl } from "../../data/sessionControl";
import { gkpProviders, gkpRunTelemetry, gkpRuns } from "../../data/gkpFixtures";
import { PUBLIC_DECODER_KEYS, parseDecoderKey } from "../../data/decoders";
import { ScientificCompletenessPanel } from "../scientific/ScientificCompletenessPanel";
import { ScientificEmptyState } from "../scientific/ScientificEmptyState";
import { ScientificIntegrityAlert } from "../scientific/ScientificIntegrityAlert";
import { ScientificStateBanner } from "../scientific/ScientificStateBanner";
import { resolveScientificState, scientificStateLabel } from "../scientific/stateMachine";

type ValidationStrictness = "lenient" | "balanced" | "strict";
type ValidationEnvironment = "dev" | "staging" | "prod";
type ValidationWindow = "1h" | "24h" | "7d";

interface RunOption {
  id: string;
  dataset: string;
  providerName: string;
  providerKind: ProviderKind;
  status: Run["status"];
  updatedAt: string;
  raw: Run;
}

interface ValidationSummary {
  perPct: number;
  warningRatePct: number;
  triggerRatePct: number;
  logicalErrorRatePct: number;
  decoderGapPct: number;
  coveragePct: number;
  requestCount: number;
  rounds: number;
  stabilizerCount: number;
  updatedAt: string;
  missingSignals: string[];
}

interface ValidationCheck {
  id: string;
  label: string;
  current: string;
  target: string;
  status: "pass" | "warn" | "fail";
  rationale: string;
}

interface KpiCardModel {
  key: string;
  label: string;
  value: string;
  detail: string;
}

interface StrictnessProfile {
  perMax: number;
  warningMax: number;
  triggerMax: number;
  logicalErrorMax: number;
  decoderGapMax: number;
  coverageMin: number;
}

interface BaselineSummary {
  perPct: number;
  warningRatePct: number;
  sampleCount: number;
}

interface RegressionCheck {
  id: string;
  label: string;
  current: string;
  baseline: string;
  delta: string;
  status: "pass" | "warn" | "fail";
}

interface DriftSignal {
  id: string;
  label: string;
  current: string;
  previous: string;
  delta: string;
  status: "pass" | "warn" | "fail";
}

interface PolicyItem {
  id: string;
  title: string;
  requirement: string;
  status: "pass" | "warn" | "fail";
  detail: string;
}

interface ValidationRecommendation {
  id: string;
  title: string;
  severity: "fail" | "warn";
  evidence: string;
  action: string;
}

interface EvidenceReference {
  label: string;
  href: string;
}

interface TargetEvidence {
  sourceType: "literature" | "calibrated" | "policy";
  basis: string;
  rationale: string;
  references: EvidenceReference[];
}

const strictnessProfiles: Record<ValidationStrictness, StrictnessProfile> = {
  lenient: {
    perMax: 2.4,
    warningMax: 32,
    triggerMax: 48,
    logicalErrorMax: 14,
    decoderGapMax: 95,
    coverageMin: 90,
  },
  balanced: {
    perMax: 1.8,
    warningMax: 25,
    triggerMax: 38,
    logicalErrorMax: 10,
    decoderGapMax: 70,
    coverageMin: 97,
  },
  strict: {
    perMax: 1.2,
    warningMax: 18,
    triggerMax: 28,
    logicalErrorMax: 7,
    decoderGapMax: 50,
    coverageMin: 99,
  },
};

const targetEvidenceByCheckId: Record<string, TargetEvidence> = {
  coverage: {
    sourceType: "policy",
    basis: "Minimum observable syndrome evidence per run.",
    rationale: "Coverage gates are local policy to prevent decisions from under-observed telemetry.",
    references: [{ label: "Gottesman (1997) Stabilizer Formalism", href: "https://arxiv.org/abs/quant-ph/9705052" }],
  },
  per: {
    sourceType: "literature",
    basis: "Physical noise floor should remain in a regime compatible with active QEC benefit.",
    rationale: "PER thresholds are anchored to literature guidance, then tuned per simulator backend and environment.",
    references: [{ label: "Fowler et al. (2012) Surface Codes", href: "https://arxiv.org/abs/1208.0928" }],
  },
  warning: {
    sourceType: "calibrated",
    basis: "Warning-rate envelope is learned from baseline runtime runs.",
    rationale: "Warnings are implementation-specific; limits are calibrated from local historical behavior.",
    references: [],
  },
  trigger: {
    sourceType: "literature",
    basis: "Syndrome trigger activity tracks stabilizer-detected fault pressure.",
    rationale: "Target direction follows stabilizer code literature; exact values are platform calibrated.",
    references: [{ label: "Terhal (2015) Quantum Error Correction Review", href: "https://arxiv.org/abs/1302.3428" }],
  },
  "logical-error": {
    sourceType: "literature",
    basis: "Logical error rate should remain below correction budget for release gates.",
    rationale: "Logical-error constraints are set from code-performance literature then tuned for runtime deployment.",
    references: [{ label: "Fowler et al. (2012) Surface Codes", href: "https://arxiv.org/abs/1208.0928" }],
  },
  consistency: {
    sourceType: "policy",
    basis: "Decoder disagreement should stay bounded under identical fault streams.",
    rationale: "Cross-decoder gap is a runtime reliability gate rather than a universal constant.",
    references: [],
  },
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function average(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function percentDelta(current: number, previous: number): number {
  if (!Number.isFinite(current) || !Number.isFinite(previous)) {
    return 0;
  }
  const baseline = Math.max(1e-9, Math.abs(previous));
  return ((current - previous) / baseline) * 100;
}

function formatAgo(isoText: string | null | undefined): string {
  if (!isoText) {
    return "unknown";
  }
  const parsed = new Date(isoText).getTime();
  if (!Number.isFinite(parsed)) {
    return "unknown";
  }
  const deltaMinutes = Math.max(0, Math.floor((Date.now() - parsed) / 60_000));
  if (deltaMinutes < 1) {
    return "just now";
  }
  if (deltaMinutes < 60) {
    return `${deltaMinutes}m ago`;
  }
  const hours = Math.floor(deltaMinutes / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function parseStrictness(value: string | null): ValidationStrictness {
  if (value === "lenient" || value === "strict") {
    return value;
  }
  return "balanced";
}

function parseEnvironment(value: string | null): ValidationEnvironment {
  if (value === "dev" || value === "prod") {
    return value;
  }
  return "staging";
}

function parseWindow(value: string | null): ValidationWindow {
  if (value === "1h" || value === "7d") {
    return value;
  }
  return "24h";
}

function parseIsoToMs(value: string): number {
  const parsed = new Date(value).getTime();
  return Number.isFinite(parsed) ? parsed : 0;
}

function evaluateMax(value: number, target: number): "pass" | "warn" | "fail" {
  if (value <= target) {
    return "pass";
  }
  if (value <= target * 1.15) {
    return "warn";
  }
  return "fail";
}

function evaluateMin(value: number, target: number): "pass" | "warn" | "fail" {
  if (value >= target) {
    return "pass";
  }
  if (value >= target * 0.95) {
    return "warn";
  }
  return "fail";
}

function evaluateIncrease(deltaPct: number): "pass" | "warn" | "fail" {
  if (deltaPct <= 5) {
    return "pass";
  }
  if (deltaPct <= 15) {
    return "warn";
  }
  return "fail";
}

function checkBadgeClass(status: ValidationCheck["status"]): string {
  if (status === "pass") {
    return "status-success";
  }
  if (status === "warn") {
    return "status-warning";
  }
  return "status-failed";
}

function checkLabel(status: ValidationCheck["status"]): string {
  if (status === "pass") {
    return "Pass";
  }
  if (status === "warn") {
    return "At Risk";
  }
  return "Fail";
}

function targetEvidenceSourceLabel(sourceType: TargetEvidence["sourceType"]): string {
  if (sourceType === "literature") {
    return "Literature + Calibration";
  }
  if (sourceType === "calibrated") {
    return "Baseline Calibration";
  }
  return "Runtime Policy";
}

function providerKindLabel(kind: ProviderKind): string {
  if (kind === "photonic") {
    return "Photonic";
  }
  if (kind === "superconducting") {
    return "Superconducting";
  }
  if (kind === "trapped_ion") {
    return "Trapped Ion";
  }
  if (kind === "simulated") {
    return "Simulated";
  }
  return "Other";
}

function normalizeProviderName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) {
    return "Unknown";
  }
  return trimmed.replace(/^[^A-Za-z0-9]+/, "");
}

function summarizeTelemetry(telemetry: RunTelemetry, run: Run | null): ValidationSummary {
  const noiseSamples = telemetry.noise_samples ?? [];
  const syndromeSamples = telemetry.syndrome_samples ?? [];
  const interventions = (telemetry.decoder_interventions ?? []).filter((intervention) => {
    const decoderKey = parseDecoderKey(intervention.decoder);
    return decoderKey != null && PUBLIC_DECODER_KEYS.includes(decoderKey);
  });

  const perPct = average(noiseSamples.map((sample) => sample.physical_error_rate)) * 100;
  const warningRatePct = clamp((telemetry.warning_rate ?? perPct / 100) * 100, 0, 100);
  const triggerRatePct =
    syndromeSamples.length > 0
      ? (syndromeSamples.filter((sample) => sample.is_triggered).length / syndromeSamples.length) * 100
      : 0;
  const exactEntries = (telemetry.decoder_exact_metrics ?? [])
    .filter((entry) => {
      const decoderKey = parseDecoderKey(entry.decoder);
      return (
        decoderKey != null &&
        PUBLIC_DECODER_KEYS.includes(decoderKey) &&
        entry.trials > 0 &&
        entry.logical_failures >= 0 &&
        entry.logical_failures <= entry.trials
      );
    })
    .sort(
      (left, right) =>
        left.logical_failures / left.trials - right.logical_failures / right.trials,
    );
  const bestExactEntry = exactEntries[0] ?? null;
  const logicalErrorRatePct =
    run?.metrics?.logical_error_rate != null
      ? clamp(run.metrics.logical_error_rate * 100, 0, 100)
      : bestExactEntry
        ? clamp((bestExactEntry.logical_failures / bestExactEntry.trials) * 100, 0, 100)
        : 100;

  const residualByDecoder = interventions.reduce(
    (acc, intervention) => {
      const key = intervention.decoder;
      const previous = acc.get(key) ?? { residual: 0, count: 0 };
      previous.residual += intervention.residual_weight;
      previous.count += 1;
      acc.set(key, previous);
      return acc;
    },
    new Map<string, { residual: number; count: number }>(),
  );
  const averageResiduals = Array.from(residualByDecoder.values()).map((entry) => entry.residual / Math.max(1, entry.count));
  const bestResidual = averageResiduals.length > 0 ? Math.min(...averageResiduals) : 0;
  const worstResidual = averageResiduals.length > 0 ? Math.max(...averageResiduals) : 0;
  const decoderGapPct = bestResidual > 0 ? ((worstResidual - bestResidual) / bestResidual) * 100 : 0;

  const expectedSyndromePoints = Math.max(1, telemetry.rounds * telemetry.stabilizer_count);
  const coveragePct = clamp((syndromeSamples.length / expectedSyndromePoints) * 100, 0, 180);

  const missingSignals: string[] = [];
  if (noiseSamples.length === 0) {
    missingSignals.push("noise-samples");
  }
  if (syndromeSamples.length === 0) {
    missingSignals.push("syndrome-stream");
  }
  if (interventions.length === 0) {
    missingSignals.push("decoder-interventions");
  }
  if (run?.metrics?.logical_error_rate == null && bestExactEntry == null) {
    missingSignals.push("exact-logical-error-rate");
  }

  return {
    perPct: Number(perPct.toFixed(4)),
    warningRatePct: Number(warningRatePct.toFixed(3)),
    triggerRatePct: Number(triggerRatePct.toFixed(3)),
    logicalErrorRatePct: Number(logicalErrorRatePct.toFixed(3)),
    decoderGapPct: Number(clamp(decoderGapPct, 0, 500).toFixed(3)),
    coveragePct: Number(coveragePct.toFixed(2)),
    requestCount: telemetry.request_count,
    rounds: telemetry.rounds,
    stabilizerCount: telemetry.stabilizer_count,
    updatedAt: telemetry.updated_at,
    missingSignals,
  };
}

function recommendationForCheck(check: ValidationCheck): ValidationRecommendation {
  const severity = check.status === "fail" ? "fail" : "warn";
  if (check.id === "coverage") {
    return {
      id: `check-${check.id}`,
      title: "Increase validation coverage before accepting this run",
      severity,
      evidence: `${check.label}: ${check.current} against target ${check.target}.`,
      action:
        "Repeat the run with complete syndrome capture, then confirm noise samples, syndrome stream, decoder interventions, and exact logical-error counters are all present.",
    };
  }
  if (check.id === "per") {
    return {
      id: `check-${check.id}`,
      title: "Reduce the physical-noise profile and rerun the same circuit",
      severity,
      evidence: `${check.label}: ${check.current} against target ${check.target}.`,
      action:
        "Lower the selected noise injection, check architecture-specific calibration, and compare the rerun against this run before treating the decoder result as stable.",
    };
  }
  if (check.id === "warning") {
    return {
      id: `check-${check.id}`,
      title: "Inspect warning sources before promotion",
      severity,
      evidence: `${check.label}: ${check.current} against target ${check.target}.`,
      action:
        "Open Logs for the selected run, identify parser or runtime warning sources, then rerun after removing non-scientific warning causes.",
    };
  }
  if (check.id === "trigger") {
    return {
      id: `check-${check.id}`,
      title: "Review syndrome-trigger density and code-distance choice",
      severity,
      evidence: `${check.label}: ${check.current} against target ${check.target}.`,
      action:
        "Inspect the syndrome map, reduce the injected noise or loss model, or test a larger code distance, then rerun and compare trigger density against the same gate.",
    };
  }
  if (check.id === "logical-error") {
    return {
      id: `check-${check.id}`,
      title: "Improve logical reliability before accepting the decoder result",
      severity,
      evidence: `${check.label}: ${check.current} against target ${check.target}.`,
      action:
        "Compare MWPM, BP, and Union-Find exact counters, increase shots or code distance if needed, and rerun the circuit with the best-performing decoder policy.",
    };
  }
  return {
    id: `check-${check.id}`,
    title: "Investigate decoder disagreement under the same syndrome stream",
    severity,
    evidence: `${check.label}: ${check.current} against target ${check.target}.`,
    action:
      "Confirm all decoder policies consumed the same syndrome stream, then compare residual weights and correction volumes before accepting the ranking.",
  };
}

function recommendationForRegression(check: RegressionCheck): ValidationRecommendation {
  const severity = check.status === "fail" ? "fail" : "warn";
  return {
    id: `regression-${check.id}`,
    title: `${check.label} needs baseline review`,
    severity,
    evidence: `Current ${check.current}, baseline ${check.baseline}, delta ${check.delta}.`,
    action:
      check.id === "per"
        ? "Compare this run with the same-backend baseline, then rerun with the same circuit and a controlled noise profile before updating public evidence."
        : "Inspect warning logs against the baseline run set, remove runtime or parser warning sources, and rerun before promotion.",
  };
}

function recommendationForDrift(signal: DriftSignal): ValidationRecommendation {
  const severity = signal.status === "fail" ? "fail" : "warn";
  return {
    id: `drift-${signal.id}`,
    title: `${signal.label} changed across the selected window`,
    severity,
    evidence: `Current ${signal.current}, previous ${signal.previous}, delta ${signal.delta}.`,
    action:
      "Compare the current and previous-window runs, then repeat the selected circuit if the drift is not explained by an intentional noise, simulator, or decoder-policy change.",
  };
}

export function ValidationPage() {
  const { isApi, isMock, systemOff, activeDecoder } = useDataMode();
  const apiEnabled = isApi && !systemOff;
  const {
    state: { activeRunId: sessionRunId },
  } = useSessionControl();
  const runsQuery = useRuns({ enabled: apiEnabled });
  const providersQuery = useProviders({ enabled: apiEnabled });
  const [searchParams, setSearchParams] = useSearchParams();

  const strictness = parseStrictness(searchParams.get("strictness"));
  const environment = parseEnvironment(searchParams.get("env"));
  const windowFilter = parseWindow(searchParams.get("window"));
  const runFilter = searchParams.get("run") ?? "auto";

  const setFilterParam = (key: string, value: string, defaultValue: string) => {
    setSearchParams((currentParams) => {
      const nextParams = new URLSearchParams(currentParams);
      if (!value || value === defaultValue) {
        nextParams.delete(key);
      } else {
        nextParams.set(key, value);
      }
      return nextParams;
    });
  };

  const providers = systemOff ? [] : isMock ? gkpProviders : providersQuery.data ?? [];
  const runs = systemOff ? [] : isMock ? gkpRuns : runsQuery.data ?? [];

  const providerLookup = useMemo(
    () =>
      new Map(
        providers.map((provider) => [
          provider.id,
          {
            name: provider.name,
            kind: provider.kind,
          },
        ]),
      ),
    [providers],
  );

  const runOptions = useMemo<RunOption[]>(
    () =>
      [...runs]
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
        .map((run) => {
          const provider = providerLookup.get(run.provider_id);
          return {
            id: run.id,
            dataset: run.dataset_label,
            providerName: provider ? normalizeProviderName(provider.name) : run.provider_id.slice(0, 8),
            providerKind: provider?.kind ?? "other",
            status: run.status,
            updatedAt: run.updated_at,
            raw: run,
          };
        }),
    [providerLookup, runs],
  );

  const runsById = useMemo(() => new Map(runOptions.map((run) => [run.id, run])), [runOptions]);

  const selectedRun = useMemo(() => {
    if (runOptions.length === 0) {
      return null;
    }
    if (runFilter !== "auto") {
      const candidate = runsById.get(runFilter);
      if (candidate) {
        return candidate;
      }
    }
    if (sessionRunId) {
      const sessionCandidate = runsById.get(sessionRunId);
      if (sessionCandidate) {
        return sessionCandidate;
      }
    }
    return runOptions[0];
  }, [runFilter, runOptions, runsById, sessionRunId]);

  const runTelemetryQuery = useRunTelemetry(selectedRun?.id ?? null, {
    enabled: apiEnabled && Boolean(selectedRun?.id),
    scientificMode: true,
  });
  const mockTelemetry = useMemo(
    () =>
      selectedRun
        ? {
            ...gkpRunTelemetry,
            run_id: selectedRun.id,
            updated_at: selectedRun.updatedAt,
          }
        : null,
    [selectedRun],
  );

  const telemetry = systemOff ? null : isMock ? mockTelemetry : runTelemetryQuery.data ?? null;
  const summary = useMemo(
    () => (telemetry ? summarizeTelemetry(telemetry, selectedRun?.raw ?? null) : null),
    [selectedRun?.raw, telemetry],
  );
  const thresholds = useMemo(() => {
    const base = strictnessProfiles[strictness];
    const factor = environment === "prod" ? 0.85 : environment === "dev" ? 1.18 : 1.0;
    return {
      perMax: base.perMax * factor,
      warningMax: base.warningMax * factor,
      triggerMax: base.triggerMax * factor,
      logicalErrorMax: base.logicalErrorMax * factor,
      decoderGapMax: base.decoderGapMax * factor,
      coverageMin: clamp(base.coverageMin / factor, 0, 100),
    };
  }, [environment, strictness]);

  const checks = useMemo<ValidationCheck[]>(() => {
    if (!summary) {
      return [];
    }
    return [
      {
        id: "coverage",
        label: "Telemetry Coverage",
        current: `${summary.coveragePct.toFixed(1)}%`,
        target: `>= ${thresholds.coverageMin.toFixed(1)}%`,
        status: evaluateMin(summary.coveragePct, thresholds.coverageMin),
        rationale: "Ensures enough syndrome evidence exists to trust QEC validation.",
      },
      {
        id: "per",
        label: "Average Telemetry PER",
        current: `${summary.perPct.toFixed(3)}%`,
        target: `<= ${thresholds.perMax.toFixed(2)}%`,
        status: evaluateMax(summary.perPct, thresholds.perMax),
        rationale: "Tracks simulator noise feeding the decoder.",
      },
      {
        id: "warning",
        label: "Warning Rate",
        current: `${summary.warningRatePct.toFixed(2)}%`,
        target: `<= ${thresholds.warningMax.toFixed(1)}%`,
        status: evaluateMax(summary.warningRatePct, thresholds.warningMax),
        rationale: "High warnings indicate unstable decode conditions.",
      },
      {
        id: "trigger",
        label: "Syndrome Trigger Rate",
        current: `${summary.triggerRatePct.toFixed(2)}%`,
        target: `<= ${thresholds.triggerMax.toFixed(1)}%`,
        status: evaluateMax(summary.triggerRatePct, thresholds.triggerMax),
        rationale: "Captures how frequently stabilizers detect faults.",
      },
      {
        id: "logical-error",
        label: "Logical Error Rate",
        current: `${summary.logicalErrorRatePct.toFixed(2)}%`,
        target: `<= ${thresholds.logicalErrorMax.toFixed(1)}%`,
        status: evaluateMax(summary.logicalErrorRatePct, thresholds.logicalErrorMax),
        rationale: "Tracks residual post-decoding failure pressure at logical level.",
      },
      {
        id: "consistency",
        label: "Decoder Consistency Gap",
        current: `${summary.decoderGapPct.toFixed(1)}%`,
        target: `<= ${thresholds.decoderGapMax.toFixed(1)}%`,
        status: evaluateMax(summary.decoderGapPct, thresholds.decoderGapMax),
        rationale: "Flags disagreement across decoders under the same fault stream.",
      },
    ];
  }, [summary, thresholds.coverageMin, thresholds.decoderGapMax, thresholds.logicalErrorMax, thresholds.perMax, thresholds.triggerMax, thresholds.warningMax]);

  const baselineSummary = useMemo<BaselineSummary | null>(() => {
    if (!selectedRun) {
      return null;
    }
    const candidates = runOptions.filter(
      (run) =>
        run.id !== selectedRun.id &&
        run.providerKind === selectedRun.providerKind &&
        run.raw.metrics?.physical_error_rate != null &&
        run.raw.metrics?.warning_rate != null,
    );
    if (candidates.length === 0) {
      return null;
    }

    const warningSeries = candidates.map((run) => (run.raw.metrics?.warning_rate ?? 0) * 100);
    const perSeries = candidates.map((run) => (run.raw.metrics?.physical_error_rate ?? 0) * 100);

    return {
      perPct: Number(average(perSeries).toFixed(3)),
      warningRatePct: Number(average(warningSeries).toFixed(3)),
      sampleCount: candidates.length,
    };
  }, [runOptions, selectedRun]);

  const regressionChecks = useMemo<RegressionCheck[]>(() => {
    if (!summary || !baselineSummary) {
      return [];
    }

    const toStatus = (current: number, baseline: number) => {
      if (current <= baseline) {
        return "pass" as const;
      }
      return evaluateIncrease(percentDelta(current, baseline));
    };

    const metrics = [
      {
        id: "per",
        label: "PER Regression",
        current: summary.perPct,
        baseline: baselineSummary.perPct,
        unit: "%",
        digits: 3,
      },
      {
        id: "warning",
        label: "Warning-Rate Regression",
        current: summary.warningRatePct,
        baseline: baselineSummary.warningRatePct,
        unit: "%",
        digits: 2,
      },
    ];

    return metrics.map((metric) => {
      const deltaPct = percentDelta(metric.current, Math.max(0.001, metric.baseline));
      return {
        id: metric.id,
        label: metric.label,
        current: `${metric.current.toFixed(metric.digits)}${metric.unit}`,
        baseline: `${metric.baseline.toFixed(metric.digits)}${metric.unit}`,
        delta: `${deltaPct >= 0 ? "+" : ""}${deltaPct.toFixed(1)}%`,
        status: toStatus(metric.current, metric.baseline),
      };
    });
  }, [baselineSummary, summary]);

  const windowMs = windowFilter === "1h" ? 3_600_000 : windowFilter === "24h" ? 86_400_000 : 604_800_000;

  const driftSignals = useMemo<DriftSignal[]>(() => {
    const now = Date.now();
    const currentWindowRuns = runOptions.filter((run) => {
      const ageMs = now - parseIsoToMs(run.updatedAt);
      return ageMs >= 0 && ageMs <= windowMs;
    });
    const previousWindowRuns = runOptions.filter((run) => {
      const ageMs = now - parseIsoToMs(run.updatedAt);
      return ageMs > windowMs && ageMs <= windowMs * 2;
    });

    const averageWarningRate = (runs: RunOption[]) => {
      const samples = runs
        .filter((run) => run.raw.metrics?.warning_rate != null)
        .map((run) => (run.raw.metrics?.warning_rate ?? 0) * 100);
      return samples.length > 0 ? average(samples) : 0;
    };
    const averageSatisfaction = (runs: RunOption[]) => {
      const samples = runs
        .filter((run) => run.raw.metrics?.syndrome_satisfaction_rate != null)
        .map((run) => (run.raw.metrics?.syndrome_satisfaction_rate ?? 0) * 100);
      return samples.length > 0 ? average(samples) : 0;
    };
    const failureRate = (runs: RunOption[]) => {
      if (runs.length === 0) {
        return 0;
      }
      const failed = runs.filter((run) => run.status === "failed" || run.status === "cancelled").length;
      return (failed / runs.length) * 100;
    };

    const currentWarningRuns = currentWindowRuns.filter((run) => run.raw.metrics?.warning_rate != null);
    const previousWarningRuns = previousWindowRuns.filter((run) => run.raw.metrics?.warning_rate != null);
    const currentSatisfactionRuns = currentWindowRuns.filter((run) => run.raw.metrics?.syndrome_satisfaction_rate != null);
    const previousSatisfactionRuns = previousWindowRuns.filter((run) => run.raw.metrics?.syndrome_satisfaction_rate != null);

    if (
      currentWarningRuns.length === 0 ||
      previousWarningRuns.length === 0 ||
      currentSatisfactionRuns.length === 0 ||
      previousSatisfactionRuns.length === 0
    ) {
      return [];
    }

    const currentWarning = averageWarningRate(currentWarningRuns);
    const previousWarning = averageWarningRate(previousWarningRuns);
    const currentFailure = failureRate(currentWindowRuns);
    const previousFailure =
      previousWindowRuns.length > 0 ? failureRate(previousWindowRuns) : currentFailure;
    const currentSatisfaction = averageSatisfaction(currentSatisfactionRuns);
    const previousSatisfaction = averageSatisfaction(previousSatisfactionRuns);

    const warningDelta = percentDelta(currentWarning, Math.max(0.01, previousWarning));
    const failureDelta = percentDelta(currentFailure, Math.max(0.01, previousFailure));
    const satisfactionDrop = percentDelta(
      Math.max(0.01, previousSatisfaction - currentSatisfaction),
      Math.max(0.01, previousSatisfaction),
    );

    return [
      {
        id: "warning-drift",
        label: "Warning-Rate Drift",
        current: `${currentWarning.toFixed(2)}%`,
        previous: `${previousWarning.toFixed(2)}%`,
        delta: `${warningDelta >= 0 ? "+" : ""}${warningDelta.toFixed(1)}%`,
        status: warningDelta <= 0 ? "pass" : evaluateIncrease(warningDelta),
      },
      {
        id: "failure-drift",
        label: "Failure-Rate Drift",
        current: `${currentFailure.toFixed(2)}%`,
        previous: `${previousFailure.toFixed(2)}%`,
        delta: `${failureDelta >= 0 ? "+" : ""}${failureDelta.toFixed(1)}%`,
        status: failureDelta <= 0 ? "pass" : evaluateIncrease(failureDelta),
      },
      {
        id: "satisfaction-drift",
        label: "Syndrome-Satisfaction Drift",
        current: `${currentSatisfaction.toFixed(2)}%`,
        previous: `${previousSatisfaction.toFixed(2)}%`,
        delta: `${currentSatisfaction - previousSatisfaction >= 0 ? "+" : ""}${(
          currentSatisfaction - previousSatisfaction
        ).toFixed(2)} pp`,
        status:
          currentSatisfaction >= previousSatisfaction
            ? "pass"
            : evaluateIncrease(Math.max(0, satisfactionDrop)),
      },
    ];
  }, [runOptions, windowMs]);

  const policyItems = useMemo<PolicyItem[]>(() => {
    const failedCheckCount = checks.filter((check) => check.status === "fail").length;
    const warnCheckCount = checks.filter((check) => check.status === "warn").length;
    const passCheckCount = checks.filter((check) => check.status === "pass").length;

    const baselineStatus: PolicyItem["status"] = !baselineSummary
      ? "warn"
      : regressionChecks.some((check) => check.status === "fail")
        ? "fail"
        : regressionChecks.some((check) => check.status === "warn")
          ? "warn"
          : "pass";
    const gateStatus: PolicyItem["status"] =
      failedCheckCount > 0 ? "fail" : warnCheckCount > 0 ? "warn" : checks.length > 0 ? "pass" : "warn";
    const driftStatus: PolicyItem["status"] =
      driftSignals.length === 0
        ? "warn"
        : driftSignals.some((signal) => signal.status === "fail")
          ? "fail"
          : driftSignals.some((signal) => signal.status === "warn")
            ? "warn"
            : "pass";
    const exportStatus: PolicyItem["status"] = summary ? "pass" : "warn";

    return [
      {
        id: "baseline",
        title: "Baseline Regression By Backend",
        requirement: "Current run should not degrade against the same-backend baseline.",
        status: baselineStatus,
        detail: baselineSummary
          ? `${regressionChecks.length} regression checks evaluated from ${baselineSummary.sampleCount} baseline run(s).`
          : "Historical baseline not available yet for this backend family.",
      },
      {
        id: "env-gates",
        title: "Environment Acceptance Gates",
        requirement: `All validation checks should pass for ${environment.toUpperCase()} thresholds.`,
        status: gateStatus,
        detail:
          failedCheckCount > 0
            ? `${failedCheckCount} check(s) failed under ${environment} gates.`
            : warnCheckCount > 0
              ? `${warnCheckCount} check(s) at risk under ${environment} gates.`
              : `${passCheckCount}/${checks.length} checks passed under ${environment} gates.`,
      },
      {
	        id: "drift",
	        title: "Windowed Drift Detection",
	        requirement: `No major warning/failure/satisfaction drift in ${windowFilter} window.`,
	        status: driftStatus,
	        detail:
	          driftSignals.length === 0
	            ? "Not enough exact current/previous metric history for drift comparison."
	            : `${driftSignals.filter((signal) => signal.status !== "pass").length} drift alert(s) need attention.`,
	      },
      {
        id: "export",
        title: "Dataset-Level Report Export",
        requirement: "Validation evidence should be exportable for audit and sign-off.",
        status: exportStatus,
        detail: summary
          ? "JSON/CSV export is available for the selected run."
          : "Select a run with telemetry to enable export evidence.",
      },
    ];
  }, [baselineSummary, checks, driftSignals, environment, regressionChecks, summary, windowFilter]);

  const recommendations = useMemo<ValidationRecommendation[]>(() => {
    const missingSignalRecommendations = summary?.missingSignals.length
      ? [
          {
            id: "missing-scientific-signals",
            title: "Complete missing scientific signals before relying on this validation",
            severity: "fail" as const,
            evidence: `Missing: ${summary.missingSignals.join(", ")}.`,
            action:
              "Rerun or replay the session after confirming the public API returns noise samples, syndrome samples, decoder interventions, and exact decoder metrics.",
          },
        ]
      : [];

    return [
      ...missingSignalRecommendations,
      ...checks.filter((check) => check.status !== "pass").map((check) => recommendationForCheck(check)),
      ...regressionChecks
        .filter((check) => check.status !== "pass")
        .map((check) => recommendationForRegression(check)),
      ...driftSignals
        .filter((signal) => signal.status !== "pass")
        .map((signal) => recommendationForDrift(signal)),
    ];
  }, [checks, driftSignals, regressionChecks, summary?.missingSignals]);

  const targetEvidenceRows = useMemo(
    () =>
      checks.map((check) => ({
        check,
        evidence: targetEvidenceByCheckId[check.id] ?? null,
      })),
    [checks],
  );

  const passCount = checks.filter((check) => check.status === "pass").length;
  const warnCount = checks.filter((check) => check.status === "warn").length;
  const failCount = checks.filter((check) => check.status === "fail").length;
  const scientificValidationPassed = checks.length > 0 && failCount === 0;
  const scientificStateResult = useMemo(
    () =>
      resolveScientificState({
        run: selectedRun?.raw ?? null,
        telemetry,
        activeDecoder,
        validationPassed: scientificValidationPassed,
      }),
    [activeDecoder, scientificValidationPassed, selectedRun?.raw, telemetry],
  );
  const scientificMissingSignalsLabel =
    scientificStateResult.completeness.missingSignals.length === 0
      ? "None"
      : scientificStateResult.completeness.missingSignals.join(", ");
  const validationState =
    checks.length === 0 ? "No checks" : failCount > 0 ? "Fail" : warnCount > 0 ? "Review" : "Pass";
  const latestUpdatedAt = summary?.updatedAt ?? selectedRun?.updatedAt ?? null;

  const kpiCards: KpiCardModel[] = [
    {
      key: "checks-pass",
      label: "Checks Passed",
      value: `${passCount}/${checks.length || 0}`,
      detail: "threshold checks with available telemetry",
    },
    {
      key: "checks-risk",
      label: "Checks At Risk",
      value: `${warnCount}`,
      detail: "checks in review state",
    },
    {
      key: "checks-fail",
      label: "Checks Failed",
      value: `${failCount}`,
      detail: "checks outside selected thresholds",
    },
    {
      key: "per",
      label: "Average Telemetry PER",
      value: `${(summary?.perPct ?? 0).toFixed(3)}%`,
      detail: "from telemetry noise samples",
    },
    {
      key: "ler",
      label: "Logical Error Rate",
      value: `${(summary?.logicalErrorRatePct ?? 0).toFixed(3)}%`,
      detail: "from run metrics or exact decoder rows",
    },
    {
      key: "evidence",
      label: "Evidence Points",
      value: `${summary ? summary.requestCount : 0}`,
      detail: `${summary ? summary.rounds : 0} rounds, ${summary ? summary.stabilizerCount : 0} stabilizers`,
    },
  ];

  const loading = apiEnabled && (runsQuery.isLoading || providersQuery.isLoading || (Boolean(selectedRun) && runTelemetryQuery.isLoading));
  const error = apiEnabled && (runsQuery.isError || providersQuery.isError || (Boolean(selectedRun) && runTelemetryQuery.isError));
  const empty = !loading && !error && !selectedRun;

  return (
    <div className="validation-page">
      <div className="header">
        <h1>Validation</h1>
        <p>Scientific standards and evidence checks for decoder runs.</p>
      </div>

      <div className="trust-strip">
        <div className="trust-item">
          <span>Data Source</span>
          <strong>{systemOff ? "Off" : isMock ? "GKP Mock" : "Live API"}</strong>
        </div>
        <div className="trust-item">
          <span>Selected Run</span>
          <strong>{selectedRun ? selectedRun.id.slice(0, 8) : "None"}</strong>
        </div>
        <div className="trust-item">
          <span>Last Refresh</span>
          <strong>{formatAgo(latestUpdatedAt)}</strong>
        </div>
        <div className="trust-item">
          <span>Validation State</span>
          <strong>{validationState}</strong>
        </div>
        <div className="trust-item">
          <span>Scientific State</span>
          <strong>{scientificStateLabel(scientificStateResult.state)}</strong>
        </div>
        <div className="trust-item">
          <span>Scientific Missing Signals</span>
          <strong>{scientificMissingSignalsLabel}</strong>
        </div>
      </div>

      <div className="dashboard-filterbar validation-filterbar">
        <div className="filter-group">
          <label>Run</label>
          <select
            className="select-field research-select"
            value={selectedRun?.id ?? "auto"}
            onChange={(event) => setFilterParam("run", event.target.value, "auto")}
          >
            <option value="auto">Auto</option>
            {runOptions.map((run) => (
              <option key={run.id} value={run.id}>
                {run.id.slice(0, 8)} · {run.dataset}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label>Strictness</label>
          <select
            className="select-field research-select"
            value={strictness}
            onChange={(event) => setFilterParam("strictness", event.target.value, "balanced")}
          >
            <option value="lenient">Lenient</option>
            <option value="balanced">Balanced</option>
            <option value="strict">Strict</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Environment</label>
          <select
            className="select-field research-select"
            value={environment}
            onChange={(event) => setFilterParam("env", event.target.value, "staging")}
          >
            <option value="dev">Dev</option>
            <option value="staging">Staging</option>
            <option value="prod">Prod</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Drift Window</label>
          <select
            className="select-field research-select"
            value={windowFilter}
            onChange={(event) => setFilterParam("window", event.target.value, "24h")}
          >
            <option value="1h">1h</option>
            <option value="24h">24h</option>
            <option value="7d">7d</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Provider</label>
          <div className="validation-inline-field">
            {selectedRun ? `${selectedRun.providerName} · ${providerKindLabel(selectedRun.providerKind)}` : "N/A"}
          </div>
        </div>
        <div className="filter-group">
          <label>Run Status</label>
          <div className="validation-inline-field">{selectedRun ? selectedRun.status : "N/A"}</div>
        </div>
      </div>

      <div className="scope-meta">
        Scope: {runOptions.length} runs available ({environment} gates, {windowFilter} drift window). Evidence
        points: {summary ? summary.requestCount : 0} requests, {summary ? summary.rounds : 0} rounds,{" "}
        {summary ? summary.stabilizerCount : 0} stabilizers.
      </div>

      <div className="section-title">Scientific Evidence State</div>
      <div className="panel-subtitle">State-machine status for scientific metric contracts used by validation.</div>
      <ScientificStateBanner result={scientificStateResult} />
      {scientificStateResult.state === "DEGRADED" ? (
        <ScientificIntegrityAlert issues={scientificStateResult.integrityIssues} />
      ) : null}
      <ScientificCompletenessPanel result={scientificStateResult} />
      {scientificStateResult.state === "IDLE" ? <ScientificEmptyState /> : null}

      {loading ? (
        <div className="empty-card">
          <strong>Loading Validation Signals</strong>
          <p>Collecting run, provider, and telemetry data.</p>
        </div>
      ) : null}

      {error ? (
        <div className="empty-card">
          <strong>Validation Data Unavailable</strong>
          <p>Run/provider/telemetry endpoints are unavailable.</p>
        </div>
      ) : null}

      {empty ? (
        <div className="empty-card">
          <strong>No Runs Available</strong>
          <p>Create or replay a run, then return here for validation scoring.</p>
        </div>
      ) : null}

      {selectedRun && !summary && !loading && !error ? (
        <div className="empty-card">
          <strong>No Telemetry Yet</strong>
          <p>Selected run has no telemetry payload yet. Start/continue the adapter session and refresh.</p>
        </div>
      ) : null}

      {summary ? (
        <>
          <div className="section-title">Validation Summary</div>
          <div className="panel-subtitle">Threshold compliance view derived from scientific inputs and policy gates.</div>
          <div className="kpi-grid">
            {kpiCards.map((card) => (
              <div key={card.key} className="kpi-card">
                <div className="kpi-label">{card.label}</div>
                <div className="kpi-value">{card.value}</div>
                <div className="kpi-trend">{card.detail}</div>
              </div>
            ))}
          </div>

          <div className="table-container">
            <div className="table-wrapper">
              <div className="section-title">Validation Checks</div>
              <div className="panel-subtitle">
                These checks determine whether your QEC pipeline and decoders are operating within target thresholds.
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Check</th>
                    <th>Current</th>
                    <th>Target</th>
                    <th>Status</th>
                    <th>Why It Matters</th>
                  </tr>
                </thead>
                <tbody>
                  {checks.map((check) => (
                    <tr key={check.id}>
                      <td>{check.label}</td>
                      <td>{check.current}</td>
                      <td>{check.target}</td>
                      <td>
                        <span className={`status-badge ${checkBadgeClass(check.status)}`}>● {checkLabel(check.status)}</span>
                      </td>
                      <td>{check.rationale}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="validation-recommendations section-offset">
            <div className="section-title">Validation Recommendations</div>
            <div className="panel-subtitle">
              Corrective actions are generated from failed, at-risk, missing-signal, regression, or drift checks.
            </div>
            {recommendations.length > 0 ? (
              <div className="validation-recommendation-grid">
                {recommendations.map((recommendation) => (
                  <div key={recommendation.id} className={`validation-recommendation-card ${recommendation.severity}`}>
                    <div className="workflow-head">
                      <div className="workflow-title">{recommendation.title}</div>
                      <span className={`status-badge ${checkBadgeClass(recommendation.severity)}`}>
                        ● {checkLabel(recommendation.severity)}
                      </span>
                    </div>
                    <div className="workflow-detail">{recommendation.evidence}</div>
                    <div className="validation-recommendation-action">{recommendation.action}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="validation-recommendation-card clear">
                <div className="workflow-title">No corrective action required for the selected gates</div>
                <div className="workflow-detail">
                  All available validation, baseline, and drift checks pass for the current strictness and environment.
                </div>
              </div>
            )}
          </div>

          <div className="table-container section-offset">
            <div className="table-wrapper">
              <div className="section-title">Baseline Regression</div>
              <div className="panel-subtitle">
                Compares selected run against historical baseline from the same simulator backend.
              </div>
              {baselineSummary ? (
                <>
                  <div className="scope-meta">
                    Baseline sample size: {baselineSummary.sampleCount} run(s) · PER{" "}
                    {baselineSummary.perPct.toFixed(3)}% · Warning {baselineSummary.warningRatePct.toFixed(2)}%
                  </div>
                  <table>
                    <thead>
                      <tr>
                        <th>Regression Check</th>
                        <th>Current</th>
                        <th>Baseline</th>
                        <th>Delta</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {regressionChecks.map((check) => (
                        <tr key={check.id}>
                          <td>{check.label}</td>
                          <td>{check.current}</td>
                          <td>{check.baseline}</td>
                          <td>{check.delta}</td>
                          <td>
                            <span className={`status-badge ${checkBadgeClass(check.status)}`}>
                              ● {checkLabel(check.status)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              ) : (
                <div className="empty-card">Not enough historical runs for backend-family baseline yet.</div>
              )}
            </div>
          </div>

          <div className="workflow-section">
            <div className="section-title">Drift Alerts</div>
            <div className="panel-subtitle">Compares exact current-window metrics against exact previous-window metrics.</div>
            <div className="workflow-grid">
              {driftSignals.length > 0 ? (
                driftSignals.map((signal) => (
                  <div
                    key={signal.id}
                    className={`workflow-card ${
                      signal.status === "fail" ? "critical" : signal.status === "warn" ? "warning" : "info"
                    }`}
                  >
                    <div className="workflow-head">
                      <div className="workflow-title">{signal.label}</div>
                      <span className={`status-badge ${checkBadgeClass(signal.status)}`}>● {checkLabel(signal.status)}</span>
                    </div>
                    <div className="workflow-detail">Current: {signal.current}</div>
                    <div className="workflow-detail">Previous: {signal.previous}</div>
                    <div className="workflow-metric">Delta: {signal.delta}</div>
                  </div>
                ))
              ) : (
                <div className="empty-card">Not enough exact metric history for drift comparison in this window.</div>
              )}
            </div>
          </div>

          <div className="table-container section-offset">
            <div className="table-wrapper">
              <div className="section-title">Validation Policy</div>
              <div className="panel-subtitle">
                Runtime policy status for promotion decisions and release readiness.
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Policy Item</th>
                    <th>Requirement</th>
                    <th>Status</th>
                    <th>Current State</th>
                  </tr>
                </thead>
                <tbody>
                  {policyItems.map((item) => (
                    <tr key={item.id}>
                      <td>{item.title}</td>
                      <td>{item.requirement}</td>
                      <td>
                        <span className={`status-badge ${checkBadgeClass(item.status)}`}>● {checkLabel(item.status)}</span>
                      </td>
                      <td>{item.detail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="table-container section-offset">
            <div className="table-wrapper">
              <div className="section-title">Target Basis & Literature</div>
              <div className="panel-subtitle">
                Distinguishes literature-backed constraints from local calibration and runtime policy gates.
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Check</th>
                    <th>Target Basis</th>
                    <th>Source Type</th>
                    <th>Rationale</th>
                    <th>Supporting Literature</th>
                  </tr>
                </thead>
                <tbody>
                  {targetEvidenceRows.map(({ check, evidence }) => (
                    <tr key={`evidence-${check.id}`}>
                      <td>{check.label}</td>
                      <td>{evidence?.basis ?? "Internal gate definition."}</td>
                      <td>{evidence ? targetEvidenceSourceLabel(evidence.sourceType) : "Runtime Policy"}</td>
                      <td>{evidence?.rationale ?? "Target is defined as a local runtime control."}</td>
                      <td>
                        {evidence && evidence.references.length > 0
                          ? evidence.references.map((reference, index) => (
                              <span key={reference.href}>
                                {index > 0 ? " · " : ""}
                                <a href={reference.href} target="_blank" rel="noreferrer">
                                  {reference.label}
                                </a>
                              </span>
                            ))
                          : "Internal policy and baseline data"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="scope-meta">
                Literature constrains the direction of acceptable behavior; numeric gates are finalized using local
                baseline data, strictness profile, and environment.
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
